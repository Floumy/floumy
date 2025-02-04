import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityType, Notification, StatusType } from './notification.entity';
import { ViewNotificationDto } from './dtos';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { InitiativeComment } from '../roadmap/initiatives/initiative-comment.entity';
import { WorkItemComment } from '../backlog/work-items/work-item-comment.entity';
import { FeatureRequestComment } from '../feature-requests/feature-request-comment.entity';
import { IssueComment } from '../issues/issue-comment.entity';
import { KeyResultComment } from '../okrs/key-result-comment.entity';
import { ObjectiveComment } from '../okrs/objective-comment.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(InitiativeComment)
    private featureCommentsRepository: Repository<InitiativeComment>,
    @InjectRepository(Initiative)
    private featuresRepository: Repository<Initiative>,
    @InjectRepository(WorkItemComment)
    private workItemCommentsRepository: Repository<WorkItemComment>,
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(FeatureRequestComment)
    private featureRequestCommentsRepository: Repository<FeatureRequestComment>,
    @InjectRepository(IssueComment)
    private issueCommentsRepository: Repository<IssueComment>,
    @InjectRepository(KeyResultComment)
    private keyResultCommentsRepository: Repository<KeyResultComment>,
    @InjectRepository(ObjectiveComment)
    private objectiveCommentsRepository: Repository<ObjectiveComment>,
  ) {}

  async listNotifications(
    userId: string,
    orgId: string,
    projectId: string,
  ): Promise<ViewNotificationDto[]> {
    const notifications = await this.notificationsRepository.find({
      where: {
        user: {
          id: userId,
        },
        org: {
          id: orgId,
        },
        project: {
          id: projectId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['createdBy'],
      select: {
        id: true,
        entity: true,
        action: true,
        status: true,
        entityId: true,
        createdAt: true,
        createdBy: {
          id: true,
          email: true,
          name: true,
        },
      },
    });
    return await Promise.all(
      notifications.map(async (notification) => {
        let entityName: string;
        let entityUrl: string;
        switch (notification.entity) {
          case EntityType.INITIATIVE_COMMENT:
            const featureComment =
              await this.featureCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['feature'],
              });
            const feature = await featureComment.initiatives;
            entityName = feature.reference + ': ' + feature.title;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/detail/${feature.id}`;
            break;
          case EntityType.INITIATIVE_DESCRIPTION:
            const f = await this.featuresRepository.findOneOrFail({
              where: { id: notification.entityId },
            });
            entityName = f.reference + ': ' + f.title;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/detail/${f.id}`;
            break;
          case EntityType.WORK_ITEM_COMMENT:
            const workItemComment =
              await this.workItemCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['workItem'],
              });
            const workItem = await workItemComment.workItem;
            entityName = workItem.reference + ': ' + workItem.title;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${workItem.id}`;
            break;
          case EntityType.WORK_ITEM_DESCRIPTION:
            const wi = await this.workItemsRepository.findOneOrFail({
              where: { id: notification.entityId },
            });
            entityName = wi.reference + ': ' + wi.title;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${wi.id}`;
            break;
          case EntityType.FEATURE_REQUEST_COMMENT:
            const featureRequestComment =
              await this.featureRequestCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['featureRequest'],
              });
            const featureRequest = await featureRequestComment.featureRequest;
            entityName = featureRequest.title;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/feature-requests/edit/${featureRequest.id}`;
            break;
          case EntityType.ISSUE_COMMENT:
            const issueComment =
              await this.issueCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['issue'],
              });
            const issue = await issueComment.issue;
            entityName = issue.title;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/issues/edit/${issue.id}`;
            break;
          case EntityType.KEY_RESULT_COMMENT:
            const keyResultComment =
              await this.keyResultCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['keyResult'],
              });
            const keyResult = await keyResultComment.keyResult;
            entityName = keyResult.reference + ': ' + keyResult.title;
            const o = await keyResult.objective;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/okrs/${o.id}/kr/detail/${keyResult.id}`;
            break;
          case EntityType.OBJECTIVE_COMMENT:
            const objectiveComment =
              await this.objectiveCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['objective'],
              });
            const objective = await objectiveComment.objective;
            entityName = objective.reference + ': ' + objective.title;
            entityUrl = `/admin/orgs/${orgId}/projects/${projectId}/okrs/detail/${objective.id}`;
            break;
          default:
            entityName = 'Unknown';
        }
        return {
          id: notification.id,
          entity: notification.entity,
          action: notification.action,
          status: notification.status,
          entityName: entityName,
          entityUrl: entityUrl,
          entityId: notification.entityId,
          createdAt: notification.createdAt,
          createdBy: await notification.createdBy,
        };
      }),
    );
  }

  async countUnreadNotifications(
    userId: string,
    orgId: string,
    projectId: string,
  ) {
    return await this.notificationsRepository.count({
      where: {
        user: {
          id: userId,
        },
        org: {
          id: orgId,
        },
        project: {
          id: projectId,
        },
        status: StatusType.UNREAD,
      },
    });
  }

  async markAsRead(userId: string, notificationIds: string[]) {
    await this.notificationsRepository.update(
      {
        user: { id: userId },
        id: In(notificationIds),
      },
      {
        status: StatusType.READ,
      },
    );
  }

  async deleteNotification(userId: string, notificationId: string) {
    await this.notificationsRepository.delete({
      id: notificationId,
      user: { id: userId },
    });
  }

  async deleteAllNotifications(
    userId: string,
    orgId: string,
    projectId: string,
  ) {
    await this.notificationsRepository.delete({
      user: { id: userId },
      org: { id: orgId },
      project: { id: projectId },
    });
  }
}
