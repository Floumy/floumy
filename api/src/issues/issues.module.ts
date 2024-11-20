import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { Issue } from './issue.entity';
import { IssueComment } from './issue-comment.entity';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Org,
      Issue,
      IssueComment,
      Project,
      WorkItem,
    ]),
    OrgsModule,
    AuthModule,
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}
