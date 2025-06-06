import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Gitlab } from '@gitbeaker/node';
import { Project } from '../projects/project.entity';
import { ConfigService } from '@nestjs/config';
import { MergeRequestEvent, PushEvent } from './dtos';
import { GitlabBranch } from './gitlab-branch.entity';
import { GitlabMergeRequest } from './gitlab-merge-request.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { GitlabMergeRequestMapper } from './mappers';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { GitlabEvents } from './events';

@Injectable()
export class GitlabService {
  private readonly logger = new Logger(GitlabService.name);

  constructor(
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
    private readonly eventEmitter: EventEmitter2,
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
    if (!gitlabProjectId) {
      throw new Error('GitLab project ID is required');
    }

    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    if (project.gitlabProjectId === gitlabProjectId) {
      return {
        id: gitlabProjectId,
        name: project.gitlabProjectName,
        url: project.gitlabProjectUrl,
      };
    }

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
        project.id,
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

    this.eventEmitter.emit(GitlabEvents.ProcessBranches, { project });
    this.eventEmitter.emit(GitlabEvents.ProcessMergeRequests, { project });

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

      await gitlab.ProjectHooks.remove(project.gitlabProjectId, hookId);
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
    if (token !== this.configService.get('gitlab.webhookSecret')) {
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
        } else if (this.isDeleteBranch(pushEvent)) {
          const branchName = pushEvent.ref.replace('refs/heads/', '');
          await this.handleDeleteBranch(project, branchName);
        }
        break;
      }
      case 'Merge Request Hook': {
        const mrEvent = payload as MergeRequestEvent;
        switch (mrEvent.object_attributes.action) {
          case 'open':
            await this.handleNewMergeRequest(project, mrEvent);
            break;
          case 'update':
          case 'reopen':
          case 'close':
          case 'merge':
            await this.handleMergeRequestUpdate(project, mrEvent);
            break;
        }
        break;
      }
    }
  }

  private isNewBranch(pushEvent: PushEvent) {
    return pushEvent.before === '0000000000000000000000000000000000000000';
  }

  private isDeleteBranch(pushEvent: PushEvent) {
    return pushEvent.after === '0000000000000000000000000000000000000000';
  }

  private getWorkItemReferenceForMergeRequest(mergeRequest: any) {
    const workItemReference = this.getWorkItemReference(mergeRequest.title);

    if (workItemReference) {
      return workItemReference;
    }

    const branchName = mergeRequest.source_branch.toLowerCase();

    const workItemReferenceFromBranch = this.getWorkItemReference(branchName);

    if (workItemReferenceFromBranch) {
      return workItemReferenceFromBranch;
    }

    return null;
  }

  private getWorkItemReference(text: string) {
    const workItemReference = text.toLowerCase().match(/wi-\d+/);
    if (!workItemReference || workItemReference.length === 0) {
      return null;
    }

    return workItemReference[0];
  }

  @OnEvent(GitlabEvents.ProcessBranches)
  private async processBranches(payload: { project: Project }) {
    try {
      const token = this.encryptionService.decrypt(
        payload.project.gitlabAccessToken,
      );
      const gitlab = new Gitlab({
        token,
      });
      const branches = await gitlab.Branches.all(
        payload.project.gitlabProjectId,
      );

      for (const branch of branches) {
        await this.handleNewBranch(payload.project, branch.name);
      }
    } catch (error) {
      console.error('Error processing branches:', error);
    }
  }

  private async getMergeRequestWorkItem(
    project: Project,
    mergeRequest: any,
  ): Promise<WorkItem | null> {
    const workItemReference =
      this.getWorkItemReferenceForMergeRequest(mergeRequest);
    if (!workItemReference) {
      return;
    }
    const org = await project.org;
    return await this.workItemRepository.findOne({
      where: {
        reference: workItemReference.toUpperCase(),
        org: { id: org.id },
        project: { id: project.id },
      },
    });
  }

  @OnEvent(GitlabEvents.ProcessMergeRequests)
  private async processMergeRequests(payload: { project: Project }) {
    try {
      const token = this.encryptionService.decrypt(
        payload.project.gitlabAccessToken,
      );
      const gitlab = new Gitlab({
        token,
      });
      const mergeRequests = await gitlab.MergeRequests.all({
        projectId: payload.project.gitlabProjectId,
      });
      for (const mergeRequest of mergeRequests) {
        const workItem = await this.getMergeRequestWorkItem(
          payload.project,
          mergeRequest,
        );

        const notes = await gitlab.MergeRequestNotes.all(
          payload.project.gitlabProjectId,
          mergeRequest.iid,
        );

        const approvedAt = notes.find((note) =>
          note.body.includes('approved this merge request'),
        )?.created_at;

        let firstReviewAt = null;
        if (notes && notes.length > 0) {
          const firstReviewNote = notes
            .filter((note) => !note.system)
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            )[0];
          firstReviewAt = firstReviewNote
            ? new Date(firstReviewNote.created_at)
            : null;
        }

        const mergedAt = mergeRequest.merged_at;
        const closedAt = mergeRequest.closed_at ?? mergedAt;
        const gitlabMergeRequest = new GitlabMergeRequest();
        gitlabMergeRequest.title = mergeRequest.title;
        gitlabMergeRequest.url = mergeRequest.web_url;
        gitlabMergeRequest.state = mergeRequest.state;
        gitlabMergeRequest.createdAt = new Date(mergeRequest.created_at);
        gitlabMergeRequest.updatedAt = new Date(mergeRequest.updated_at);
        gitlabMergeRequest.mergedAt = mergedAt ? new Date(mergedAt) : null;
        gitlabMergeRequest.closedAt = closedAt ? new Date(closedAt) : null;
        gitlabMergeRequest.approvedAt = approvedAt
          ? new Date(approvedAt)
          : null;
        gitlabMergeRequest.firstReviewAt = firstReviewAt;
        gitlabMergeRequest.org = Promise.resolve(payload.project.org);
        gitlabMergeRequest.project = Promise.resolve(payload.project);
        gitlabMergeRequest.workItem = Promise.resolve(workItem);
        await this.gitlabMergeRequestRepository.save(gitlabMergeRequest);
      }
    } catch (error) {
      console.error('Error processing merge requests:', error);
    }
  }

  private async handleNewBranch(project: Project, branchName: string) {
    const workItemReference = this.getWorkItemReference(branchName);
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
      branch.org = Promise.resolve(project.org);
      branch.workItem = Promise.resolve(workItem);
      branch.org = Promise.resolve(await project.org);
      branch.url = `${project.gitlabProjectUrl}/-/tree/${branchName}`;
      branch.state = 'open';
      await this.gitlabBranchRepository.save(branch);
    }
  }

  private async handleDeleteBranch(project: Project, branchName: string) {
    const branch = await this.gitlabBranchRepository.findOne({
      where: { name: branchName, project: { id: project.id } },
    });

    if (!branch) return;

    branch.state = 'closed';
    branch.deletedAt = new Date();
    await this.gitlabBranchRepository.save(branch);
  }

  private async handleNewMergeRequest(
    project: Project,
    mergeRequestEvent: MergeRequestEvent,
  ) {
    const workItem = await this.getMergeRequestWorkItem(
      project,
      mergeRequestEvent.object_attributes,
    );

    const gitlabMergeRequest = new GitlabMergeRequest();
    gitlabMergeRequest.title = mergeRequestEvent.object_attributes.title;
    gitlabMergeRequest.url = mergeRequestEvent.object_attributes.url;
    gitlabMergeRequest.state = mergeRequestEvent.object_attributes.state;
    gitlabMergeRequest.createdAt = new Date(
      mergeRequestEvent.object_attributes.created_at,
    );
    gitlabMergeRequest.updatedAt = new Date(
      mergeRequestEvent.object_attributes.updated_at,
    );
    gitlabMergeRequest.org = Promise.resolve(project.org);
    gitlabMergeRequest.project = Promise.resolve(project);
    gitlabMergeRequest.workItem = Promise.resolve(workItem);
    await this.gitlabMergeRequestRepository.save(gitlabMergeRequest);
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
      gitlabProject: await this.getGitlabProject(orgId, projectId),
    };
  }

  private async getGitlabProject(orgId: string, projectId: string) {
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

  async listMergeRequests(orgId: string, projectId: string) {
    const allOpenMergeRequests = await this.gitlabMergeRequestRepository.find({
      where: {
        org: { id: orgId },
        project: { id: projectId },
        state: 'opened',
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      list: await Promise.all(
        allOpenMergeRequests.map(GitlabMergeRequestMapper.toDto),
      ),
    };
  }

  async disconnectGitlabProject(orgId: string, projectId: string) {
    const project = await this.projectRepository.findOneOrFail({
      where: {
        id: projectId,
        org: {
          id: orgId,
        },
      },
    });

    if (!project.gitlabProjectId) {
      return;
    }

    if (project.gitlabProjectWebhookId) {
      await this.deleteProjectWebhook(
        orgId,
        projectId,
        project.gitlabProjectWebhookId,
      );
    }

    await this.cleanupGitlabRepoAssociations(projectId);

    project.gitlabProjectId = null;
    project.gitlabProjectWebhookId = null;
    project.gitlabAccessToken = null;
    project.gitlabProjectUrl = null;
    project.gitlabProjectName = null;
    await this.projectRepository.save(project);
  }

  private async handleMergeRequestUpdate(
    project: Project,
    mrEvent: MergeRequestEvent,
  ) {
    const workItemReference = this.getWorkItemReferenceForMergeRequest(
      mrEvent.object_attributes,
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

    const existingGitlabMergeRequest =
      await this.gitlabMergeRequestRepository.findOne({
        where: {
          url: mrEvent.object_attributes.url,
          workItem: { id: workItem.id },
        },
      });

    if (existingGitlabMergeRequest) {
      existingGitlabMergeRequest.state = mrEvent.object_attributes.state;
      existingGitlabMergeRequest.title = mrEvent.object_attributes.title;
      return await this.gitlabMergeRequestRepository.save(
        existingGitlabMergeRequest,
      );
    }

    return await this.handleNewMergeRequest(project, mrEvent);
  }

  async getPRsCycleTime(
    orgId: string,
    projectId: string,
    timeframeInDays: number,
  ) {
    return await this.gitlabMergeRequestRepository.query(
      `SELECT date_trunc('week', "createdAt") AS week,
              COUNT(*)                        AS "prCount",
              AVG(EXTRACT(EPOCH FROM (COALESCE("mergedAt", "closedAt", NOW()) - "createdAt")) /
                  3600)                       AS "averageCycleTime"
       FROM gitlab_merge_request
       WHERE "orgId" = $1
         AND "projectId" = $2
         AND "createdAt" >= NOW() - $3::INTERVAL
       GROUP BY week
       ORDER BY week`,
      [orgId, projectId, `${timeframeInDays} days`],
    );
  }

  async getAverageMergeTime(
    orgId: string,
    projectId: string,
    timeframeInDays: number,
  ) {
    return await this.gitlabMergeRequestRepository.query(
      `SELECT date_trunc('week', "createdAt") AS week,
              COUNT(*)                        AS "prCount",
              AVG(EXTRACT(EPOCH FROM (COALESCE("mergedAt", "closedAt", NOW()) - "approvedAt")) /
                  3600)                       AS "averageMergeTime"
       FROM gitlab_merge_request
       WHERE "orgId" = $1
         AND "projectId" = $2
         AND "createdAt" >= NOW() - $3::INTERVAL
         AND "approvedAt" IS NOT NULL
       GROUP BY week
       ORDER BY week`,
      [orgId, projectId, `${timeframeInDays} days`],
    );
  }

  async getAverageFirstReviewTime(
    orgId: string,
    projectId: string,
    timeframeInDays: number,
  ) {
    return await this.gitlabMergeRequestRepository.query(
      `SELECT date_trunc('week', "createdAt") AS week,
              COUNT(*)                        AS "prCount",
              AVG(EXTRACT(EPOCH FROM (COALESCE("firstReviewAt", "closedAt", NOW()) - "createdAt")) /
                  3600)                       AS "averageFirstReviewTime"
       FROM gitlab_merge_request
       WHERE "orgId" = $1
         AND "projectId" = $2
         AND "createdAt" >= NOW() - $3::INTERVAL
         AND "firstReviewAt" IS NOT NULL
       GROUP BY week
       ORDER BY week`,
      [orgId, projectId, `${timeframeInDays} days`],
    );
  }

  private async cleanupGitlabRepoAssociations(projectId: string) {
    await this.gitlabMergeRequestRepository.delete({
      project: { id: projectId },
    });

    await this.gitlabBranchRepository.delete({
      project: { id: projectId },
    });
  }
}
