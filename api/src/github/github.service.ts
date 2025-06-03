import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Project } from '../projects/project.entity';
import crypto from 'crypto';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { GithubBranch } from './github-branch.entity';
import { GithubPullRequest } from './github-pull-request.entity';
import { GithubPullRequestMapper } from './mappers';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { GithubEvents } from './events';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  constructor(
    @Inject('GITHUB_CLIENT') private readonly octokit: any,
    private readonly configService: ConfigService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly encryptionService: EncryptionService,
    @InjectRepository(WorkItem)
    private readonly workItemRepository: Repository<WorkItem>,
    @InjectRepository(GithubBranch)
    private readonly githubBranchRepository: Repository<GithubBranch>,
    @InjectRepository(GithubPullRequest)
    private readonly githubPullRequestRepository: Repository<GithubPullRequest>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async isConnected(orgId: string, projectId: string) {
    const token = await this.getToken(projectId);

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
    const token = await this.getToken(projectId);

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

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.githubRepositoryId) {
      await this.cleanupGithubRepoAssociation(project);
    }

    project.githubRepositoryId = repo.id;
    project.githubRepositoryFullName = repo.full_name;
    project.githubRepositoryUrl = repo.html_url;

    await this.projectRepository.save(project);
    await this.setupWebhook(orgId, projectId);

    this.eventEmitter.emit(GithubEvents.ProcessPullRequests, {
      orgId,
      project,
    });
    this.eventEmitter.emit(GithubEvents.ProcessBranches, {
      orgId,
      project,
    });
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

  async getRepos(projectId: string) {
    const token = await this.getToken(projectId);

    if (!token) {
      throw new Error('No token found');
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();

    return repos.map(
      (repo: {
        id: number;
        name: string;
        full_name: string;
        url: string;
        html_url: string;
      }) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        url: repo.url,
        html_url: repo.html_url,
      }),
    );
  }

  async getAuthUrl(orgId: string, projectId: string) {
    const clientId = this.configService.get('github.clientId');
    const redirectUri = this.configService.get('github.redirectUri');

    const state = await this.generateState({
      orgId,
      projectId,
    });

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${state}&prompt=consent`;
  }

  async handleOAuthCallback(code: string, state: string) {
    try {
      const { orgId, projectId } = await this.decodeState(state);

      const { token } = (await this.octokit.auth({
        type: 'oauth-user',
        code: code,
      })) as any;

      const user = await this.getUser(token);

      await this.projectRepository.update(projectId, {
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

  async listPullRequests(orgId: string, projectId: string) {
    const allOpenPullRequests = await this.githubPullRequestRepository.find({
      where: {
        org: { id: orgId },
        project: { id: projectId },
        state: 'open',
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return {
      list: await Promise.all(
        allOpenPullRequests.map(GithubPullRequestMapper.toDto),
      ),
    };
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

  private async getToken(projectId: string) {
    const token = (
      await this.projectRepository.findOneByOrFail({ id: projectId })
    ).githubAccessToken;

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

    switch (action) {
      case 'opened':
        await this.onNewPullRequest(project, pr);
        break;
      case 'edited':
        await this.onPullRequestUpdated(project, pr);
        break;
      case 'closed':
      case 'reopened':
      case 'merged':
        await this.onPullRequestChangeState(project, pr);
        break;
    }
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

  private async setupWebhook(orgId: string, projectId: string) {
    const token = await this.getToken(projectId);
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

    const { data: webhook } = await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: webhookSecret,
      },
      events: ['pull_request', 'push', 'create', 'delete'],
    });
    project.githubRepositoryWebhookId = webhook.id;
    await this.projectRepository.save(project);
  }

  private async onBranchCreated(project: Project, ref: any) {
    const workItemReference = await this.getWorkItemReference(ref);

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

    const githubBranch = new GithubBranch();
    githubBranch.name = ref;
    githubBranch.url = this.getBranchUrl(project.githubRepositoryFullName, ref);
    githubBranch.state = 'open';
    githubBranch.createdAt = new Date();
    githubBranch.updatedAt = new Date();
    githubBranch.org = Promise.resolve(org);
    githubBranch.project = Promise.resolve(project);
    githubBranch.workItem = Promise.resolve(workItem);
    await this.githubBranchRepository.save(githubBranch);
  }

  private async getPullRequestWorkItemReference(pr: any) {
    const prWorkItemReference = await this.getWorkItemReference(pr.title);
    if (prWorkItemReference) {
      return prWorkItemReference;
    }

    const branchWorkItemReference = await this.getWorkItemReference(
      pr.head.ref,
    );
    if (branchWorkItemReference) {
      return branchWorkItemReference;
    }

    return null;
  }

  private async onNewPullRequest(
    project: Project,
    pr: any,
    approvedAt: Date = null,
    firstReviewAt: Date = null,
  ) {
    let workItem = undefined;
    const org = await project.org;
    const workItemReference = await this.getPullRequestWorkItemReference(pr);
    if (workItemReference) {
      workItem = await this.workItemRepository.findOne({
        where: {
          reference: workItemReference.toUpperCase(),
          org: { id: org.id },
          project: { id: project.id },
        },
      });
    }

    const githubPullRequest = new GithubPullRequest();
    githubPullRequest.githubId = pr.id;
    githubPullRequest.title = pr.title;
    githubPullRequest.url = pr.html_url;
    githubPullRequest.state = pr.state;
    githubPullRequest.createdAt = pr.created_at;
    githubPullRequest.updatedAt = pr.updated_at;
    githubPullRequest.mergedAt = pr.merged_at;
    githubPullRequest.closedAt = pr.closed_at;
    githubPullRequest.approvedAt = approvedAt;
    githubPullRequest.firstReviewAt = firstReviewAt;
    githubPullRequest.org = Promise.resolve(org);
    githubPullRequest.project = Promise.resolve(project);
    if (workItem) {
      githubPullRequest.workItem = Promise.resolve(workItem);
    }
    await this.githubPullRequestRepository.save(githubPullRequest);
  }

  private async getPullRequestForProject(project: Project, pr: any) {
    const workItemReference = await this.getPullRequestWorkItemReference(pr);

    if (!workItemReference) {
      return null;
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
      return null;
    }

    return await this.githubPullRequestRepository.findOne({
      where: {
        githubId: pr.id,
        org: { id: org.id },
        project: { id: project.id },
        workItem: { id: workItem.id },
      },
    });
  }

  private async onPullRequestChangeState(project: Project, pr: any) {
    const githubPullRequest = await this.getPullRequestForProject(project, pr);

    if (!githubPullRequest) {
      return;
    }

    githubPullRequest.state = pr.state;
    githubPullRequest.updatedAt = pr.updated_at;
    await this.githubPullRequestRepository.save(githubPullRequest);
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
    const workItemReference = await this.getWorkItemReference(ref);

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

    const githubBranch = await this.githubBranchRepository.findOne({
      where: {
        name: ref,
        org: { id: org.id },
        project: { id: project.id },
        workItem: { id: workItem.id },
      },
    });

    if (!githubBranch) {
      return;
    }

    githubBranch.state = 'closed';
    githubBranch.updatedAt = new Date();
    githubBranch.deletedAt = new Date();
    await this.githubBranchRepository.save(githubBranch);
  }

  private getBranchUrl(repositoryFullName: string, ref: string) {
    return `https://github.com/${repositoryFullName}/tree/${ref}`;
  }

  private async getWorkItemReference(text: string) {
    const workItemReference = text.toLowerCase().match(/wi-\d+/);
    if (!workItemReference || workItemReference.length === 0) {
      return null;
    }

    return workItemReference[0];
  }

  private async onPullRequestUpdated(project: Project, pr: any) {
    const githubPullRequest = await this.getPullRequestForProject(project, pr);

    if (!githubPullRequest) {
      return await this.onNewPullRequest(project, pr);
    }

    githubPullRequest.title = pr.title;
    githubPullRequest.url = pr.html_url;
    githubPullRequest.state = pr.state;
    githubPullRequest.updatedAt = pr.updated_at;

    await this.githubPullRequestRepository.save(githubPullRequest);
  }

  private async deleteWebhook(project: Project) {
    const token = await this.getToken(project.id);

    if (!token) {
      throw new Error('No token found');
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: repo } = await octokit.request('GET /repositories/:id', {
      id: project.githubRepositoryId,
    });

    try {
      await octokit.request('DELETE /repos/:owner/:repo/hooks/:hook_id', {
        owner: repo.owner.login,
        repo: repo.name,
        hook_id: project.githubRepositoryWebhookId,
      });
    } catch (e) {
      this.logger.error('Error deleting webhook', e);
    }
  }

  private async cleanupGithubRepoAssociation(project: Project) {
    const token = await this.getToken(project.id);

    if (!token) {
      throw new Error('No token found');
    }

    // Delete webhook
    await this.deleteWebhook(project);

    // Delete project pull requests
    await this.githubPullRequestRepository.delete({
      project: { id: project.id },
    });

    // Delete project branches
    await this.githubBranchRepository.delete({
      project: { id: project.id },
    });
  }

  @OnEvent(GithubEvents.ProcessPullRequests)
  async handleProcessPullRequests(payload: {
    orgId: string;
    project: Project;
  }) {
    try {
      await this.processGithubPullRequests(payload.project);
    } catch (error) {
      console.error('Error processing pull requests:', error);
    }
  }

  @OnEvent(GithubEvents.ProcessBranches)
  async handleProcessBranches(payload: { orgId: string; project: Project }) {
    try {
      await this.processGithubBranches(payload.project);
    } catch (error) {
      console.error('Error processing branches:', error);
    }
  }

  private async processGithubPullRequests(project: Project) {
    const token = await this.getToken(project.id);

    if (!token) {
      throw new Error('No token found');
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: repo } = await octokit.request('GET /repositories/:id', {
      id: project.githubRepositoryId,
    });
    const allPRs = await this.getPRs(octokit, repo);
    for (const pullRequest of allPRs) {
      const { data: prReview } = await octokit.request(
        'GET /repos/:owner/:repo/pulls/:pull_number/reviews',
        {
          owner: repo.owner.login,
          repo: repo.name,
          pull_number: pullRequest.number,
        },
      );
      const approvedReview = prReview.find(
        (review) => review.state === 'APPROVED',
      );

      let firstReviewAt: Date = null;
      if (prReview.length > 0) {
        const firstReview = prReview.reduce((earliest, review) => {
          if (
            !earliest ||
            new Date(review.submitted_at) < new Date(earliest.submitted_at)
          ) {
            return review;
          }
          return earliest;
        }, null);
        firstReviewAt = firstReview ? new Date(firstReview.submitted_at) : null;
      }
      await this.onNewPullRequest(
        project,
        pullRequest,
        approvedReview ? new Date(approvedReview.submitted_at) : null,
        firstReviewAt,
      );
    }
  }

  private async processGithubBranches(project: Project) {
    const allBranches = await this.getBranches(project);
    for (const branch of allBranches) {
      await this.onBranchCreated(project, branch.name);
    }
  }

  private async getBranches(project: Project) {
    const token = await this.getToken(project.id);

    if (!token) {
      throw new Error('No token found');
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    const { data: repo } = await octokit.request('GET /repositories/:id', {
      id: project.githubRepositoryId,
    });
    // Get all open branches
    const { data: branches } = await octokit.request(
      'GET /repos/:owner/:repo/branches',
      {
        owner: repo.owner.login,
        repo: repo.name,
        state: 'open',
      },
    );
    return branches;
  }

  private async getPRs(octokit, repo) {
    let allPRs = [];
    const perPage = 10;
    let page = 1;
    while (true) {
      const { data: pullRequests } = await octokit.request(
        'GET /repos/:owner/:repo/pulls',
        {
          owner: repo.owner.login,
          repo: repo.name,
          state: 'all',
          per_page: perPage,
          page,
        },
      );
      allPRs = allPRs.concat(pullRequests);
      if (pullRequests.length < perPage) {
        break;
      }
      page++;
    }
    return allPRs;
  }

  async deleteProjectGithubRepo(orgId: string, projectId: string) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    await this.cleanupGithubRepoAssociation(project);

    project.githubAccessToken = null;
    project.githubUsername = null;
    project.githubRepositoryId = null;
    project.githubRepositoryFullName = null;
    project.githubRepositoryUrl = null;
    project.githubRepositoryWebhookId = null;
    await this.projectRepository.save(project);
  }

  async getPRsCycleTime(
    orgId: string,
    projectId: string,
    timeframeInDays: number,
  ) {
    return await this.githubPullRequestRepository.query(
      `SELECT date_trunc('week', "createdAt") AS week,
              COUNT(*)                        AS "prCount",
              AVG(EXTRACT(EPOCH FROM (COALESCE("mergedAt", "closedAt", NOW()) - "createdAt")) /
                  3600)                       AS "averageCycleTime"
       FROM github_pull_request
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
    return await this.githubPullRequestRepository.query(
      `SELECT date_trunc('week', "createdAt") AS week,
              COUNT(*)                        AS "prCount",
              AVG(EXTRACT(EPOCH FROM (COALESCE("mergedAt", "closedAt", NOW()) - COALESCE("approvedAt", "createdAt"))) /
                  3600)                       AS "averageMergeTime"
       FROM github_pull_request
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
    return await this.githubPullRequestRepository.query(
      `SELECT date_trunc('week', "createdAt") AS week,
              COUNT(*)                        AS "prCount",
              AVG(EXTRACT(EPOCH FROM (COALESCE("firstReviewAt", "closedAt", NOW()) - "createdAt")) / 3600) AS "averageFirstReviewTime"
       FROM github_pull_request
       WHERE "orgId" = $1
         AND "projectId" = $2
         AND "createdAt" >= NOW() - $3::INTERVAL
       GROUP BY week
       ORDER BY week`,
      [orgId, projectId, `${timeframeInDays} days`],
    );
  }
}
