import { Injectable, Logger } from '@nestjs/common';
import { Org } from '../orgs/org.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Gitlab } from '@gitbeaker/node';
import { Project } from '../projects/project.entity';
import { ConfigService } from '@nestjs/config';
import { MergeRequestEvent, PushEvent } from './dtos';
import { GitlabBranch } from './gitlab-branch.entity';
import { GitlabMergeRequest } from './gitlab-pull-request.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';

@Injectable()
export class GitlabService {
  private readonly logger = new Logger(GitlabService.name);

  constructor(
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(GitlabBranch)
    private readonly gitlabBranchRepository: Repository<GitlabBranch>,
    @InjectRepository(GitlabMergeRequest)
    private readonly gitlabMergeRequestRepository: Repository<GitlabMergeRequest>,
    @InjectRepository(WorkItem)
    private readonly workItemRepository: Repository<WorkItem>,
    private readonly configService: ConfigService,
  ) {}

  async setToken(projectId: string, token: string) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
    });
    project.gitlabAccessToken = this.encryptionService.encrypt(token);
    await this.projectRepository.save(project);
  }

  async getProjects(projectId: string) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
    });
    const token = this.encryptionService.decrypt(project.gitlabAccessToken);
    const gitlab = new Gitlab({
      token,
    });
    const projects = await gitlab.Projects.all({
      membership: true,
      archived: false,
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      url: project.web_url,
      visibility: project.visibility,
    }));
  }

  async setProject(orgId: string, projectId: string, gitlabProjectId: string) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const token = this.encryptionService.decrypt(project.gitlabAccessToken);
    const gitlab = new Gitlab({
      token,
    });
    const gitlabProject = await gitlab.Projects.show(gitlabProjectId);
    const projectName = gitlabProject.name;
    const projectUrl = gitlabProject.web_url;

    if (project.gitlabProjectWebhookId) {
      await this.deleteProjectWebhook(
        orgId,
        project.gitlabProjectId,
        project.gitlabProjectWebhookId,
      );
      project.gitlabProjectWebhookId = null;
    }

    const webhook = await this.createProjectWebhook(
      orgId,
      projectId,
      gitlabProjectId,
    );
    project.gitlabProjectWebhookId = webhook.id;

    project.gitlabProjectId = gitlabProjectId;
    project.gitlabProjectUrl = projectUrl;
    project.gitlabProjectName = projectName;
    await this.projectRepository.save(project);

    await this.processBranches(project);
    await this.processMergeRequests(project);

    return {
      id: gitlabProjectId,
      name: project.gitlabProjectName,
      url: project.gitlabProjectUrl,
    };
  }

  private async createProjectWebhook(
    orgId: string,
    projectId: string,
    gitlabProjectId: string,
  ) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const token = this.encryptionService.decrypt(project.gitlabAccessToken);
    const gitlab = new Gitlab({ token });

    const gitlabWebhookUrlBase = this.configService.get(
      'gitlab.webhookUrlBase',
    );
    const webhookUrl = `${gitlabWebhookUrlBase}/gitlab/orgs/${orgId}/projects/${projectId}/webhooks`;

    return await gitlab.ProjectHooks.add(gitlabProjectId, webhookUrl, {
      push_events: true,
      merge_requests_events: true,
      issues_events: true,
      token: this.configService.get('gitlab.webhookSecret'),
    });
  }

  private async deleteProjectWebhook(
    orgId: string,
    projectId: string,
    hookId: number,
  ) {
    try {
      const project = await this.projectRepository.findOneByOrFail({
        id: projectId,
        org: { id: orgId },
      });
      const token = this.encryptionService.decrypt(project.gitlabAccessToken);
      const gitlab = new Gitlab({ token });

      await gitlab.ProjectHooks.remove(projectId, hookId);
    } catch (e) {
      this.logger.error('Failed to delete project webhook');
      this.logger.error(e);
    }
  }

  async handleWebhook(
    orgId: string,
    projectId: string,
    token: string,
    payload: MergeRequestEvent | PushEvent,
    eventType: string,
  ) {
    if (token !== this.configService.get('GITLAB_TOKEN')) {
      throw new Error('Invalid token');
    }
    const project = await this.projectRepository.findOne({
      where: { org: { id: orgId }, id: projectId },
    });

    switch (eventType) {
      case 'Push Hook': {
        const pushEvent = payload as PushEvent;

        // Check if this is a new branch
        if (this.isNewBranch(pushEvent)) {
          const branchName = pushEvent.ref.replace('refs/heads/', '');
          await this.handleNewBranch(project, branchName);
        }
        break;
      }

      case 'Merge Request Hook': {
        const mrEvent = payload as MergeRequestEvent;
        switch (mrEvent.object_attributes.action) {
          case 'open':
            await this.handleNewMergeRequest(project, mrEvent);
            break;
          case 'merge':
            await this.handleMergeRequestStatusChange(project, mrEvent);
            break;
          case 'close':
            await this.handleMergeRequestStatusChange(project, mrEvent);
            break;
        }
        break;
      }
    }
  }

  private isNewBranch(pushEvent: PushEvent) {
    return pushEvent.before === '0000000000000000000000000';
  }

  private async getWorkItemReference(text: string) {
    const workItemReference = text.toLowerCase().match(/wi-\d+/);
    if (!workItemReference || workItemReference.length === 0) {
      return null;
    }

    return workItemReference[0];
  }

  private async processBranches(project: Project) {
    const token = this.encryptionService.decrypt(project.gitlabAccessToken);
    const gitlab = new Gitlab({
      token,
    });
    const branches = await gitlab.Branches.all(project.gitlabProjectId);

    for (const branch of branches) {
      await this.handleNewBranch(project, branch.name);
    }
  }

  private async processMergeRequests(project: Project) {
    const token = this.encryptionService.decrypt(project.gitlabAccessToken);
    const gitlab = new Gitlab({
      token,
    });
    const mergeRequests = await gitlab.MergeRequests.all({
      projectId: project.gitlabProjectId,
    });
    for (const mergeRequest of mergeRequests) {
      const workItemReference = await this.getWorkItemReference(
        mergeRequest.title,
      );
      if (!workItemReference) {
        return;
      }
      const org = await project.org;
      const workItem = await this.workItemRepository.findOne({
        where: {
          reference: workItemReference.toUpperCase(),
          org: { id: org.id },
          project: { id: project.id },
        },
      });

      if (!workItem) {
        return;
      }

      const gitlabMergeRequest = new GitlabMergeRequest();
      gitlabMergeRequest.title = mergeRequest.title;
      gitlabMergeRequest.url = mergeRequest.web_url;
      gitlabMergeRequest.state = mergeRequest.state;
      gitlabMergeRequest.org = Promise.resolve(project.org);
      gitlabMergeRequest.project = Promise.resolve(project);
      gitlabMergeRequest.workItem = Promise.resolve(workItem);
      await this.gitlabMergeRequestRepository.save(gitlabMergeRequest);
    }
  }

  private async handleNewBranch(project: Project, branchName: string) {
    const workItemReference = await this.getWorkItemReference(branchName);
    if (!workItemReference) {
      return;
    }
    const org = await project.org;

    const workItem = await this.workItemRepository.findOne({
      where: {
        reference: workItemReference.toUpperCase(),
        org: { id: org.id },
        project: { id: project.id },
      },
    });
    if (!workItem) {
      return;
    }

    const branch = await this.gitlabBranchRepository.findOne({
      where: { name: branchName, project: { id: project.id } },
    });
    if (!branch) {
      const branch = new GitlabBranch();
      branch.name = branchName;
      branch.project = Promise.resolve(project);
      branch.org = Promise.resolve(await project.org);
      branch.url = `${project.gitlabProjectUrl}/-/tree/${branchName}`;
      branch.state = 'open';
      await this.gitlabBranchRepository.save(branch);
    }
  }

  private async handleNewMergeRequest(
    project: Project,
    mergeRequestEvent: MergeRequestEvent,
  ) {
    const workItemReference = await this.getWorkItemReference(
      mergeRequestEvent.object_attributes.title,
    );
    if (!workItemReference) {
      return;
    }
    const org = await project.org;
    const workItem = await this.workItemRepository.findOne({
      where: {
        reference: workItemReference.toUpperCase(),
        org: { id: org.id },
        project: { id: project.id },
      },
    });

    if (!workItem) {
      return;
    }

    const gitlabMergeRequest = new GitlabMergeRequest();
    gitlabMergeRequest.title = mergeRequestEvent.object_attributes.title;
    gitlabMergeRequest.url = mergeRequestEvent.object_attributes.url;
    gitlabMergeRequest.state = mergeRequestEvent.object_attributes.state;
    gitlabMergeRequest.org = Promise.resolve(project.org);
    gitlabMergeRequest.project = Promise.resolve(project);
    gitlabMergeRequest.workItem = Promise.resolve(workItem);
    await this.gitlabMergeRequestRepository.save(gitlabMergeRequest);
  }

  private async handleMergeRequestStatusChange(
    project: Project,
    mergeRequestEvent: MergeRequestEvent,
  ) {
    const workItemReference = await this.getWorkItemReference(
      mergeRequestEvent.object_attributes.title,
    );
    if (!workItemReference) {
      return;
    }

    const org = await project.org;
    const mergeRequest = await this.gitlabMergeRequestRepository.findOne({
      where: {
        url: mergeRequestEvent.object_attributes.url,
        org: { id: org.id },
        project: { id: project.id },
      },
    });

    if (!mergeRequest) {
      return;
    }

    mergeRequest.state = mergeRequestEvent.object_attributes.state;
    await this.gitlabMergeRequestRepository.save(mergeRequest);
  }

  async isConnected(orgId: string, projectId: string) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    if (!project.gitlabAccessToken) {
      return {
        connected: false,
      };
    }

    const token = this.encryptionService.decrypt(project.gitlabAccessToken);
    const gitlab = new Gitlab({
      token,
    });

    try {
      await gitlab.Projects.all({
        membership: true,
        archived: false,
      });
    } catch (error) {
      return {
        connected: false,
      };
    }

    return {
      connected: true,
      repo: await this.getProjectRepo(orgId, projectId),
    };
  }

  private async getProjectRepo(orgId: string, projectId: string) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    if (project.gitlabProjectUrl) {
      return {
        id: project.gitlabProjectId,
        name: project.gitlabProjectName,
        url: project.gitlabProjectUrl,
      };
    }

    return null;
  }
}
