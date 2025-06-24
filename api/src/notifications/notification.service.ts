import { In, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(NotificationService.name);
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

  async listNotifications(userId: string): Promise<ViewNotificationDto[]> {
    const notifications = await this.notificationsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['createdBy', 'org', 'project'],
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
    const filteredNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let entityName: string;
        let entityUrl: string;
        const org = await notification.org;
        const project = await notification.project;
        switch (notification.entity) {
          case EntityType.INITIATIVE_COMMENT:
            try {
              const featureComment =
                await this.featureCommentsRepository.findOneOrFail({
                  where: { id: notification.entityId },
                  relations: ['initiative'],
                });
              const feature = await featureComment.initiative;
              entityName = feature.reference + ': ' + feature.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/roadmap/features/detail/${feature.id}`;
            } catch (e) {
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          case EntityType.INITIATIVE_DESCRIPTION:
            try {
              const f = await this.featuresRepository.findOneOrFail({
                where: { id: notification.entityId },
              });
              entityName = f.reference + ': ' + f.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/roadmap/features/detail/${f.id}`;
            } catch (e) {
              // Cleanup the notification if the entity is not found
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          case EntityType.WORK_ITEM_COMMENT:
            try {
              const workItemComment =
                await this.workItemCommentsRepository.findOneOrFail({
                  where: { id: notification.entityId },
                  relations: ['workItem'],
                });
              const workItem = await workItemComment.workItem;
              entityName = workItem.reference + ': ' + workItem.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/work-item/edit/${workItem.id}`;
            } catch (e) {
              // Cleanup the notification if the entity is not found
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          case EntityType.WORK_ITEM_DESCRIPTION:
            try {
              const wi = await this.workItemsRepository.findOneOrFail({
                where: { id: notification.entityId },
              });
              entityName = wi.reference + ': ' + wi.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/work-item/edit/${wi.id}`;
            } catch (e) {
              // Cleanup the notification if the entity is not found
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          case EntityType.FEATURE_REQUEST_COMMENT:
            try {
              const featureRequestComment =
                await this.featureRequestCommentsRepository.findOneOrFail({
                  where: { id: notification.entityId },
                  relations: ['featureRequest'],
                });
              const featureRequest = await featureRequestComment.featureRequest;
              entityName = featureRequest.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/feature-requests/edit/${featureRequest.id}`;
            } catch (e) {
              // Cleanup the notification if the entity is not found
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          case EntityType.ISSUE_COMMENT:
            try {
              const issueComment =
                await this.issueCommentsRepository.findOneOrFail({
                  where: { id: notification.entityId },
                  relations: ['issue'],
                });
              const issue = await issueComment.issue;
              entityName = issue.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/issues/edit/${issue.id}`;
            } catch (e) {
              // Cleanup the notification if the entity is not found
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          case EntityType.KEY_RESULT_COMMENT:
            try {
              const keyResultComment =
                await this.keyResultCommentsRepository.findOneOrFail({
                  where: { id: notification.entityId },
                  relations: ['keyResult'],
                });
              const keyResult = await keyResultComment.keyResult;
              entityName = keyResult.reference + ': ' + keyResult.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/kr/detail/${keyResult.id}`;
            } catch (e) {
              // Cleanup the notification if the entity is not found
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          case EntityType.OBJECTIVE_COMMENT:
            try {
              const objectiveComment =
                await this.objectiveCommentsRepository.findOneOrFail({
                  where: { id: notification.entityId },
                  relations: ['objective'],
                });
              const objective = await objectiveComment.objective;
              entityName = objective.reference + ': ' + objective.title;
              entityUrl = `/admin/orgs/${org.id}/projects/${project.id}/okrs/detail/${objective.id}`;
            } catch (e) {
              // Cleanup the notification if the entity is not found
              this.logger.error(
                `Notification with ID ${notification.id} has an invalid entity: ${e.message}`,
              );
              await this.notificationsRepository.delete(notification.id);
              return undefined;
            }
            break;
          default:
            return undefined;
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
    return filteredNotifications.filter(
      (notification) => notification !== undefined,
    );
  }

  async countUnreadNotifications(userId: string) {
    return await this.notificationsRepository.count({
      where: {
        user: {
          id: userId,
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

  async deleteAllNotifications(userId: string) {
    await this.notificationsRepository.delete({
      user: { id: userId },
    });
  }
}
