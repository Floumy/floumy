import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubService {
  constructor(
    @Inject('GITHUB_CLIENT') private readonly octokit: any,
    private readonly configService: ConfigService,
  ) {}

  async getAuthUrl() {
    const clientId = this.configService.get('github.clientId');
    const redirectUri = this.configService.get('github.redirectUri');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
  }

  async handleOAuthCallback(code: string) {
    const Octokit = (await import('octokit')).Octokit as any;

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
