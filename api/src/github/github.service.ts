import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Project } from '../projects/project.entity';

@Injectable()
export class GithubService {
  constructor(
    @Inject('GITHUB_CLIENT') private readonly octokit: any,
    private readonly configService: ConfigService,
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async isConnected(orgId: string, projectId: string) {
    const token = await this.getToken(orgId);

    if (!token) {
      return {
        connected: false,
      };
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    try {
      await octokit.rest.users.getAuthenticated();
      return {
        connected: true,
        repo: await this.getProjectRepo(projectId, orgId),
      };
    } catch (error) {
      return {
        connected: false,
      };
    }
  }

  async updateProjectRepo(projectId: string, orgId: string, repoId: number) {
    const token = await this.getToken(orgId);

    if (!token) {
      throw new Error('No token found');
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: repo } = await octokit.request('GET /repositories/:id', {
      id: repoId,
    });

    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    project.githubRepositoryId = repo.id;
    project.githubRepositoryFullName = repo.full_name;
    project.githubRepositoryUrl = repo.html_url;

    await this.projectRepository.save(project);
    return {
      id: repo.id,
      name: repo.full_name,
      url: repo.html_url,
    };
  }

  async getProjectRepo(projectId: string, orgId: string) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    if (project.githubRepositoryUrl) {
      return {
        id: project.githubRepositoryId,
        name: project.githubRepositoryFullName,
        url: project.githubRepositoryUrl,
      };
    }

    return null;
  }

  async getProjectPullRequests(projectId: string, orgId: string) {
    const token = await this.getToken(orgId);

    if (!token) {
      throw new Error('No token found');
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: pullRequests } = await octokit.request(
      'GET /repos/:owner/:repo/pulls',
      {
        owner: orgId,
        repo: projectId,
      },
    );

    return pullRequests;
  }

  async getRepos(orgId: string) {
    const token = await this.getToken(orgId);

    if (!token) {
      throw new Error('No token found');
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();

    return repos;
  }

  async getAuthUrl(orgId: string, projectId: string) {
    const clientId = this.configService.get('github.clientId');
    const redirectUri = this.configService.get('github.redirectUri');

    const state = await this.generateState({
      orgId,
      projectId,
    });

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${state}`;
  }

  async handleOAuthCallback(code: string, state: string) {
    try {
      const { orgId, projectId } = await this.decodeState(state);

      const { token } = (await this.octokit.auth({
        type: 'oauth-user',
        code: code,
      })) as any;

      const user = await this.getUser(token);

      await this.orgRepository.update(orgId, {
        githubAccessToken: this.encryptionService.encrypt(token),
        githubUsername: user.login,
      });

      return {
        orgId,
        projectId,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication error');
    }
  }

  async getAuthenticatedOctokit(token: string) {
    const Octokit = (await import('octokit')).Octokit as any;

    return new Octokit({
      auth: token,
    });
  }

  private async getUser(token: string) {
    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: user } = await octokit.rest.users.getAuthenticated();
    return user;
  }

  private async generateState(data: any) {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private async decodeState(state: string) {
    return JSON.parse(Buffer.from(state, 'base64').toString());
  }

  private async getToken(orgId: string) {
    const token = (await this.orgRepository.findOneByOrFail({ id: orgId }))
      .githubAccessToken;

    if (!token) {
      return null;
    }

    return this.encryptionService.decrypt(token);
  }
}
