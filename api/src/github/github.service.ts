import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Project } from '../projects/project.entity';
import crypto from 'crypto';

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

  async handleWebhook(
    orgId: string,
    projectId: string,
    headers: any,
    payload: any,
  ) {
    // Verify webhook signature
    const signature = headers['x-hub-signature-256'];
    const webhookSecret = this.configService.get('github.webhookSecret');

    if (!this.verifyWebhookSignature(payload, signature, webhookSecret)) {
      throw new Error('Invalid webhook signature');
    }

    const event = headers['x-github-event'];

    switch (event) {
      case 'pull_request':
        await this.handlePullRequestEvent(orgId, projectId, payload);
        break;
      case 'push': // Push events include branch creations/deletions
        await this.handlePushEvent(orgId, projectId, payload);
        break;
      case 'create': // Branch or tag creation
        if (payload.ref_type === 'branch') {
          await this.handleBranchCreateEvent(orgId, projectId, payload);
        }
        break;
      case 'delete': // Branch or tag deletion
        if (payload.ref_type === 'branch') {
          await this.handleBranchDeleteEvent(orgId, projectId, payload);
        }
        break;
    }
  }

  private verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string,
  ): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest =
      'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }

  private async handlePullRequestEvent(
    orgId: string,
    projectId: string,
    payload: any,
  ) {
    const action = payload.action; // opened, closed, reopened, etc.
    const repo = payload.repository;
    const pr = payload.pull_request;

    // Find the corresponding project
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      githubRepositoryId: repo.id,
      org: { id: orgId },
    });

    if (!project) {
      return;
    }

    // Handle the PR event (you'll need to create these methods based on your needs)
    switch (action) {
      case 'opened':
        await this.onPullRequestOpened(project, pr);
        break;
      case 'closed':
        await this.onPullRequestClosed(project, pr);
        break;
      // Add other cases as needed
    }
  }

  private async handlePushEvent(
    orgId: string,
    projectId: string,
    payload: any,
  ) {
    const repo = payload.repository;
    const ref = payload.ref; // refs/heads/branch-name

    // Find the corresponding project
    const project = await this.projectRepository.findOneBy({
      id: projectId,
      githubRepositoryId: repo.id,
      org: { id: orgId },
    });

    if (!project) {
      return;
    }

    // Handle branch updates
    await this.onBranchUpdated(project, ref);
  }

  private async handleBranchCreateEvent(
    orgId: string,
    projectId: string,
    payload: any,
  ) {
    const repo = payload.repository;
    const ref = payload.ref; // refs/heads/branch-name

    // Find the corresponding project
    const project = await this.projectRepository.findOneBy({
      id: projectId,
      githubRepositoryId: repo.id,
      org: { id: orgId },
    });

    if (!project) {
      return;
    }

    // Handle branch creation
    await this.onBranchCreated(project, ref);
  }

  async setupWebhook(orgId: string, projectId: string) {
    const token = await this.getToken(orgId);
    if (!token) {
      throw new Error('No token found');
    }

    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    if (!project.githubRepositoryFullName) {
      throw new Error('No GitHub repository connected');
    }

    const [owner, repo] = project.githubRepositoryFullName.split('/');

    const octokit = await this.getAuthenticatedOctokit(token);

    // Create webhook
    const webhookUrlBase = this.configService.get('github.webhookUrlBase');
    const webhookUrl = `${webhookUrlBase}/github/orgs/${orgId}/projects/${projectId}/webhooks`;
    const webhookSecret = this.configService.get('github.webhookSecret');

    await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: webhookSecret,
      },
      events: ['pull_request', 'push', 'create', 'delete'],
    });
  }

  private async onBranchCreated(project: Project, ref: any) {
    // Handle branch creation
    console.log(`Branch ${ref} created`);
  }

  private async onBranchUpdated(project: Project, ref: any) {
    // Handle branch updates
    console.log(`Branch ${ref} updated`);
  }

  private async onPullRequestOpened(project: Project, pr: any) {
    // Handle pull request opened
    console.log(`Pull request ${pr.number} opened`);
  }

  private async onPullRequestClosed(project: Project, pr: any) {
    // Handle pull request closed
    console.log(`Pull request ${pr.number} closed`);
  }

  private async handleBranchDeleteEvent(
    orgId: string,
    projectId: string,
    payload: any,
  ) {
    const repo = payload.repository;
    const ref = payload.ref; // refs/heads/branch-name

    // Find the corresponding project
    const project = await this.projectRepository.findOneBy({
      id: projectId,
      githubRepositoryId: repo.id,
      org: { id: orgId },
    });

    if (!project) {
      return;
    }

    // Handle branch deletion
    await this.onBranchDeleted(project, ref);
  }

  private async onBranchDeleted(project: Project, ref: any) {
    // Handle branch deletion
    console.log(`Branch ${ref} deleted`);
  }
}
