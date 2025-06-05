import { Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';
import { EncryptionModule } from '../encryption/encryption.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { GitlabMergeRequest } from './gitlab-merge-request.entity';
import { GitlabBranch } from './gitlab-branch.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  providers: [GitlabService],
  controllers: [GitlabController],
  imports: [
    ConfigModule,
    EncryptionModule,
    AuthModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      User,
      Org,
      Project,
      GitlabBranch,
      GitlabMergeRequest,
      WorkItem,
    ]),
  ],
})
export class GitlabModule {}
