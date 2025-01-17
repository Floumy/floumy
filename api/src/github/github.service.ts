import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GithubService {
  constructor(
    @Inject('GITHUB_CLIENT') private readonly octokit: any,
    private readonly configService: ConfigService,
    @InjectRepository(Org) private readonly orgRepository: Repository<Org>,
  ) {}

  async isAuthenticated(orgId: string) {
    const token = (await this.orgRepository.findOneByOrFail({ id: orgId }))
      .githubAccessToken;
    if (!token) {
      return false;
    }

    const octokit = await this.getAuthenticatedOctokit(token);
    try {
      await octokit.rest.users.getAuthenticated();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getRepos(orgId: string) {
    const token = (await this.orgRepository.findOneByOrFail({ id: orgId }))
      .githubAccessToken;

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
        githubAccessToken: token,
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

  private async getAuthenticatedOctokit(token: string) {
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
}
