import { Injectable } from '@nestjs/common';
import { Org } from '../orgs/org.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Gitlab } from '@gitbeaker/node';
import { Project } from '../projects/project.entity';

@Injectable()
export class GitlabService {
  constructor(
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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
    webhookUrl: string,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const token = this.encryptionService.decrypt(org.gitlabToken);
    const gitlab = new Gitlab({ token });

    return await gitlab.ProjectHooks.add(projectId, webhookUrl, {
      push_events: true,
      merge_requests_events: true,
      issues_events: true,
    });
  }

  private async listProjectWebhooks(orgId: string, projectId: string) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const token = this.encryptionService.decrypt(org.gitlabToken);
    const gitlab = new Gitlab({ token });

    return await gitlab.ProjectHooks.all(projectId);
  }

  private async deleteProjectWebhook(
    orgId: string,
    projectId: string,
    hookId: number,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const token = this.encryptionService.decrypt(org.gitlabToken);
    const gitlab = new Gitlab({ token });

    await gitlab.ProjectHooks.remove(projectId, hookId);
  }
}
