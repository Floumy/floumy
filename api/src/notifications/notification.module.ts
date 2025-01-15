import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { AuthModule } from '../auth/auth.module';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { FeatureComment } from '../roadmap/features/feature-comment.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { WorkItemComment } from '../backlog/work-items/work-item-comment.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { FeatureRequestComment } from '../feature-requests/feature-request-comment.entity';
import { IssueComment } from '../issues/issue-comment.entity';
import { KeyResultComment } from '../okrs/key-result-comment.entity';
import { ObjectiveComment } from '../okrs/objective-comment.entity';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      FeatureComment,
      Feature,
      WorkItemComment,
      WorkItem,
      FeatureRequestComment,
      IssueComment,
      KeyResultComment,
      ObjectiveComment,
    ]),
    AuthModule,
  ],
})
export class NotificationModule {}
