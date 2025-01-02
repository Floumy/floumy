import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityType, Notification, StatusType } from './notification.entity';
import { CreateNotificationDto, ViewNotificationDto } from './dtos';
import { Feature } from '../roadmap/features/feature.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { FeatureComment } from '../roadmap/features/feature-comment.entity';
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
    @InjectRepository(FeatureComment)
    private featureCommentsRepository: Repository<FeatureComment>,
    @InjectRepository(Feature)
    private featuresRepository: Repository<Feature>,
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
        switch (notification.entity) {
          case EntityType.INITIATIVE_COMMENT:
            const featureComment =
              await this.featureCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['feature'],
              });
            const feature = await featureComment.feature;
            entityName = feature.reference + ': ' + feature.title;
            break;
          case EntityType.INITIATIVE_DESCRIPTION:
            const f = await this.featuresRepository.findOneOrFail({
              where: { id: notification.entityId },
            });
            entityName = f.reference + ': ' + f.title;
            break;
          case EntityType.WORK_ITEM_COMMENT:
            const workItemComment =
              await this.workItemCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['workItem'],
              });
            const workItem = await workItemComment.workItem;
            entityName = workItem.reference + ': ' + workItem.title;
            break;
          case EntityType.WORK_ITEM_DESCRIPTION:
            const wi = await this.workItemsRepository.findOneOrFail({
              where: { id: notification.entityId },
            });
            entityName = wi.reference + ': ' + wi.title;
            break;
          case EntityType.FEATURE_REQUEST_COMMENT:
            const featureRequest =
              await this.featureRequestCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['featureRequest'],
              });
            entityName = (await featureRequest.featureRequest).title;
            break;
          case EntityType.ISSUE_COMMENT:
            const issueComment =
              await this.issueCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['issue'],
              });
            entityName = (await issueComment.issue).title;
            break;
          case EntityType.KEY_RESULT_COMMENT:
            const keyResultComment =
              await this.keyResultCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['keyResult'],
              });
            const keyResult = await keyResultComment.keyResult;
            entityName = keyResult.reference + ': ' + keyResult.title;
            break;
          case EntityType.OBJECTIVE_COMMENT:
            const objectiveComment =
              await this.objectiveCommentsRepository.findOneOrFail({
                where: { id: notification.entityId },
                relations: ['objective'],
              });
            const objective = await objectiveComment.objective;
            entityName = objective.reference + ': ' + objective.title;
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

  async createNotification(payload: CreateNotificationDto) {
    const notifications: Notification[] = [];
    for (const mention of payload.mentions) {
      if (mention.id === payload.createdBy.id) {
        continue;
      }
      const alreadyExists = await this.notificationsRepository.count({
        where: {
          entityId: payload.entityId,
          user: { id: mention.id },
        },
      });
      if (!alreadyExists) {
        const notification = new Notification();
        notification.entity = payload.entity;
        notification.createdBy = Promise.resolve(payload.createdBy);
        notification.action = payload.action;
        notification.status = payload.status;
        notification.entityId = payload.entityId;
        notification.user = Promise.resolve(mention);
        notification.project = Promise.resolve(payload.project);
        notification.org = Promise.resolve(payload.org);
        notifications.push(notification);
      }
    }

    return await this.notificationsRepository.save(notifications);
  }
}
