import { NotificationController } from './notification.controller';
import { setupTestingModule } from '../../test/test.utils';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { Project } from '../projects/project.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import {
  ActionType,
  EntityType,
  Notification,
  StatusType,
} from './notification.entity';
import { FeatureComment } from '../roadmap/features/feature-comment.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { WorkItemComment } from '../backlog/work-items/work-item-comment.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { FeatureRequestComment } from '../feature-requests/feature-request-comment.entity';
import { IssueComment } from '../issues/issue-comment.entity';
import { KeyResultComment } from '../okrs/key-result-comment.entity';
import { ObjectiveComment } from '../okrs/objective-comment.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationService } from './notification.service';
import { OrgsService } from '../orgs/orgs.service';
import { TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { NotificationListener } from './notification.listener';

describe('NotificationController', () => {
  let controller: NotificationController;
  let cleanup: () => Promise<void>;
  let user: User;
  let secondUser: User;
  let thirdUser: User;
  let org: Org;
  let project: Project;
  let testingModule: TestingModule;
  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
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
      [NotificationService, NotificationListener],
      [NotificationController],
    );
    cleanup = dbCleanup;
    testingModule = module;
    controller = testingModule.get<NotificationController>(
      NotificationController,
    );
    const orgsService = testingModule.get<OrgsService>(OrgsService);
    const usersService = testingModule.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    secondUser = await usersService.createUser(
      'Second User',
      'second@example.com',
      'testtesttest',
      org,
    );
    thirdUser = await usersService.createUser(
      'Third User',
      'third@example.com',
      'testtesttest',
      org,
    );
    project = (await org.projects)[0];
  });
  afterEach(async () => {
    await cleanup();
  });
  describe('when listing notifications when there are none', () => {
    it('should return an empty list', async () => {
      const notifications = await controller.listNotifications(
        { user: user },
        org.id,
        project.id,
      );
      expect(notifications).toEqual([]);
    });
  });
  describe('when listing notifications when there are some', () => {
    let notifications: Notification[];
    beforeEach(async () => {
      const notificationListener =
        testingModule.get<NotificationListener>(NotificationListener);
      const workItemRepository = testingModule.get<Repository<WorkItem>>(
        getRepositoryToken(WorkItem),
      );
      const workItem = new WorkItem();
      workItem.project = Promise.resolve(project);
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.title = 'Test Work Item';
      workItem.description = 'Test Description';
      await workItemRepository.save(workItem);
      notifications = await notificationListener.handleCreateNotification({
        org,
        project,
        entity: EntityType.WORK_ITEM_DESCRIPTION,
        action: ActionType.CREATE,
        entityId: workItem.id,
        status: StatusType.UNREAD,
        createdBy: user,
        mentions: [secondUser, thirdUser],
      });
    });
    it('should receive available notifications', async () => {
      const notificationsList = await controller.listNotifications(
        {
          user: {
            sub: secondUser.id,
          },
        },
        org.id,
        project.id,
      );
      expect(notificationsList).toEqual([
        {
          id: notifications[0].id,
          entity: EntityType.WORK_ITEM_DESCRIPTION,
          action: ActionType.CREATE,
          status: StatusType.UNREAD,
          entityId: notifications[0].entityId,
          entityName: 'WI-1: Test Work Item',
          createdAt: notifications[0].createdAt,
          createdBy: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      ]);
      const notificationsList2 = await controller.listNotifications(
        {
          user: {
            sub: thirdUser.id,
          },
        },
        org.id,
        project.id,
      );
      expect(notificationsList2).toEqual([
        {
          id: notifications[1].id,
          entity: EntityType.WORK_ITEM_DESCRIPTION,
          action: ActionType.CREATE,
          status: StatusType.UNREAD,
          entityId: notifications[0].entityId,
          entityName: 'WI-1: Test Work Item',
          createdAt: notifications[0].createdAt,
          createdBy: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      ]);
    });
    describe('when marking a notification as read', () => {
      it('should mark the notification as read', async () => {
        await controller.markAsRead(
          {
            user: {
              sub: secondUser.id,
            },
          },
          [notifications[0].id],
        );
        const notificationsList = await controller.listNotifications(
          {
            user: {
              sub: secondUser.id,
            },
          },
          org.id,
          project.id,
        );
        expect(notificationsList).toEqual([
          {
            id: notifications[0].id,
            entity: EntityType.WORK_ITEM_DESCRIPTION,
            action: ActionType.CREATE,
            status: StatusType.READ,
            entityId: notifications[0].entityId,
            entityName: 'WI-1: Test Work Item',
            createdAt: notifications[0].createdAt,
            createdBy: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          },
        ]);
      });
    });
    describe('when counting unread notifications', () => {
      it('should return the correct count', async () => {
        const count = await controller.countUnreadNotifications(
          {
            user: {
              sub: secondUser.id,
            },
          },
          org.id,
          project.id,
        );
        expect(count).toEqual(1);
      });
    });
    describe('when deleting a notification', () => {
      it('should delete the notification', async () => {
        await controller.deleteNotification(
          {
            user: {
              sub: secondUser.id,
            },
          },
          notifications[0].id,
        );
        const notificationsList = await controller.listNotifications(
          {
            user: {
              sub: secondUser.id,
            },
          },
          org.id,
          project.id,
        );
        expect(notificationsList).toEqual([]);
      });
    });
    describe('when deleting all notifications', () => {
      it('should delete all notifications', async () => {
        await controller.deleteAllNotifications(
          {
            user: {
              sub: secondUser.id,
            },
          },
          org.id,
          project.id,
        );
        const notificationsList = await controller.listNotifications(
          {
            user: {
              sub: secondUser.id,
            },
          },
          org.id,
          project.id,
        );
        expect(notificationsList).toEqual([]);
      });
    });
  });
});
