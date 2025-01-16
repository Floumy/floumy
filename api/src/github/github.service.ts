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
        await authenticatedOctokit.rest.users.getAuthenticated();
      /**
       * {
       *   "login": "thelexned",
       *   "id": 66918833,
       *   "node_id": "MDQ6VXNlcjY2OTE4ODMz",
       *   "avatar_url": "https://avatars.githubusercontent.com/u/66918833?v=4",
       *   "gravatar_id": "",
       *   "url": "https://api.github.com/users/thelexned",
       *   "html_url": "https://github.com/thelexned",
       *   "followers_url": "https://api.github.com/users/thelexned/followers",
       *   "following_url": "https://api.github.com/users/thelexned/following{/other_user}",
       *   "gists_url": "https://api.github.com/users/thelexned/gists{/gist_id}",
       *   "starred_url": "https://api.github.com/users/thelexned/starred{/owner}{/repo}",
       *   "subscriptions_url": "https://api.github.com/users/thelexned/subscriptions",
       *   "organizations_url": "https://api.github.com/users/thelexned/orgs",
       *   "repos_url": "https://api.github.com/users/thelexned/repos",
       *   "events_url": "https://api.github.com/users/thelexned/events{/privacy}",
       *   "received_events_url": "https://api.github.com/users/thelexned/received_events",
       *   "type": "User",
       *   "user_view_type": "private",
       *   "site_admin": false,
       *   "name": "Alexandru Nedelcu",
       *   "company": "x",
       *   "blog": "",
       *   "location": null,
       *   "email": null,
       *   "hireable": null,
       *   "bio": null,
       *   "twitter_username": null,
       *   "notification_email": null,
       *   "public_repos": 13,
       *   "public_gists": 1,
       *   "followers": 1,
       *   "following": 1,
       *   "created_at": "2020-06-14T18:11:50Z",
       *   "updated_at": "2025-01-10T20:27:41Z",
       *   "private_gists": 0,
       *   "total_private_repos": 4,
       *   "owned_private_repos": 3,
       *   "disk_usage": 23167,
       *   "collaborators": 0,
       *   "two_factor_authentication": true,
       *   "plan": {
       *     "name": "free",
       *     "space": 976562499,
       *     "collaborators": 0,
       *     "private_repos": 10000
       *   }
       * }
       */
      return user;
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }
}
