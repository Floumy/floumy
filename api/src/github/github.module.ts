import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { EncryptionModule } from '../encryption/encryption.module';
import { Project } from '../projects/project.entity';
import { GithubBranch } from './github-branch.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { GithubPullRequest } from './github-pull-request.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

const octokitClientProvider = {
  provide: 'GITHUB_CLIENT',
  useFactory: async (configService: ConfigService) => {
    const Octokit = (await import('octokit')).Octokit as any;
    const createOAuthAppAuth = (await import('@octokit/auth-oauth-app'))
      .createOAuthAppAuth as any;

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
  imports: [
    ConfigModule,
    AuthModule,
    UsersModule,
    EncryptionModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      User,
      Org,
      Project,
      GithubBranch,
      GithubPullRequest,
      WorkItem,
    ]),
  ],
})
export class GithubModule {}
