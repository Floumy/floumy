import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { ConfigService } from '@nestjs/config';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { Octokit } from 'octokit';

const octokitClientProvider = {
  provide: 'GITHUB_CLIENT',
  useFactory: (configService: ConfigService) => {
    return new Octokit({
      authStrategy: createOAuthAppAuth,
      auth: {
        clientId: configService.get('github.clientId'),
        clientSecret: configService.get('github.clientSecret'),
      },
    });
  },
  inject: [ConfigService],
};

@Module({
  providers: [GithubService, octokitClientProvider],
  controllers: [GithubController],
})
export class GithubModule {}
