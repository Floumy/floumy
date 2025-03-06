import { Injectable, Logger } from '@nestjs/common';
import { Org } from '../orgs/org.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Gitlab } from '@gitbeaker/node';
import { Project } from '../projects/project.entity';
import { ConfigService } from '@nestjs/config';
import { MergeRequestEvent, PushEvent } from './dtos';

@Injectable()
export class GitlabService {
  private readonly logger = new Logger(GitlabService.name);

  constructor(
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly configService: ConfigService,
  ) {}

  async setToken(orgId: string, token: string) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    org.gitlabToken = this.encryptionService.encrypt(token);
    await this.orgRepository.save(org);
  }

  async getProjects(orgId: string) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const token = this.encryptionService.decrypt(org.gitlabToken);
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
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const token = this.encryptionService.decrypt(org.gitlabToken);
    const gitlab = new Gitlab({
      token,
    });
    const gitlabProject = await gitlab.Projects.show(gitlabProjectId);
    const projectName = gitlabProject.name;
    const projectUrl = gitlabProject.web_url;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

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
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const token = this.encryptionService.decrypt(org.gitlabToken);
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
      const org = await this.orgRepository.findOneByOrFail({ id: orgId });
      const token = this.encryptionService.decrypt(org.gitlabToken);
      const gitlab = new Gitlab({ token });

      await gitlab.ProjectHooks.remove(projectId, hookId);
    } catch (e) {
      this.logger.error('Failed to delete project webhook');
      this.logger.error(e);
    }
  }

  async handleWebhook(
    payload: MergeRequestEvent | PushEvent,
    eventType: string,
  ) {
    switch (eventType) {
      case 'Push Hook': {
        const pushEvent = payload as PushEvent;
        // Check if this is a new branch
        if (pushEvent.before === '0000000000000000000000000') {
          const branchName = pushEvent.ref.replace('refs/heads/', '');
          console.log(`New branch created: ${branchName}`);
          // Handle new branch logic here
        }
        break;
      }

      case 'Merge Request Hook': {
        const mrEvent = payload as MergeRequestEvent;
        switch (mrEvent.object_attributes.action) {
          case 'open':
            console.log(`New MR opened: ${mrEvent.object_attributes.title}`);
            // Handle new MR logic
            break;
          case 'merge':
            console.log(`MR merged: ${mrEvent.object_attributes.title}`);
            // Handle merged MR logic
            break;
          case 'close':
            console.log(`MR closed: ${mrEvent.object_attributes.title}`);
            // Handle closed MR logic
            break;
        }
        break;
      }
    }
  }
}
