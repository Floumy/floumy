import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from 'octokit';

@Injectable()
export class GithubService {
  constructor(
    @Inject('GITHUB_CLIENT') private readonly octokit: Octokit,
    private readonly configService: ConfigService,
  ) {}

  async getAuthUrl() {
    const clientId = this.configService.get('github.clientId');
    const redirectUri = this.configService.get('github.redirectUri');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
  }

  async handleOAuthCallback(code: string) {
    try {
      const { token } = (await this.octokit.auth({
        type: 'oauth-user',
        code: code,
      })) as any;

      const authenticatedOctokit = new Octokit({
        auth: token,
      });

      const { data: user } =
        await authenticatedOctokit.users.getAuthenticated();

      return user;
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }
}
