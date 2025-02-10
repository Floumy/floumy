import { SprintsController } from './sprints.controller';
import { Org } from '../orgs/org.entity';
import { InitiativesService } from '../roadmap/initiatives/initiatives.service';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../okrs/objective.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { UsersModule } from '../users/users.module';
import { OkrsService } from '../okrs/okrs.service';
import { OrgsService } from '../orgs/orgs.service';
import { TokensService } from '../auth/tokens.service';
import { MilestonesService } from '../roadmap/milestones/milestones.service';
import { WorkItemsService } from '../backlog/work-items/work-items.service';
import { UsersService } from '../users/users.service';
import { Sprint } from './sprint.entity';
import { SprintsService } from './sprints.service';
import { Priority } from '../common/priority.enum';
import { WorkItemType } from '../backlog/work-items/work-item-type.enum';
import { WorkItemStatus } from '../backlog/work-items/work-item-status.enum';
import { File } from '../files/file.entity';
import { WorkItemFile } from '../backlog/work-items/work-item-file.entity';
import { InitiativeFile } from '../roadmap/initiatives/initiative-file.entity';
import { User } from '../users/user.entity';
import { FilesService } from '../files/files.service';
import { FilesStorageRepository } from '../files/files-storage.repository';
import { Timeline } from '../common/timeline.enum';
import { Project } from '../projects/project.entity';

describe('SprintsController', () => {
  let controller: SprintsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let workItemService: WorkItemsService;
  let project: Project;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          Objective,
          KeyResult,
          Initiative,
          WorkItem,
          Milestone,
          Sprint,
          File,
          WorkItemFile,
          InitiativeFile,
        ]),
        UsersModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        InitiativesService,
        MilestonesService,
        WorkItemsService,
        SprintsService,
        FilesService,
        FilesStorageRepository,
      ],
      [SprintsController],
    );
    cleanup = dbCleanup;
    controller = module.get<SprintsController>(SprintsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    workItemService = module.get<WorkItemsService>(WorkItemsService);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when creating a new sprint', () => {
    it('should create a new sprint', async () => {
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: '2020-01-01',
          duration: 1,
        },
      );
      expect(sprint.goal).toEqual('Goal 1');
      expect(sprint.startDate).toEqual('2020-01-01');
      expect(sprint.duration).toEqual(1);
    });
  });

  describe('when listing sprints', () => {
    it('should list sprints', async () => {
      await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: '2020-01-01',
          duration: 1,
        },
      );
      const sprints = await controller.listWithWorkItems(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
      );
      expect(sprints.length).toEqual(1);
      expect(sprints[0].goal).toEqual('Goal 1');
      expect(sprints[0].startDate).toEqual('2020-01-01');
      expect(sprints[0].duration).toEqual(1);
    });
  });

  describe('when listing sprints for a timeline', () => {
    it('should list sprints for a timeline', async () => {
      const currentDateAsString = new Date().toISOString().split('T')[0];
      await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: currentDateAsString,
          duration: 1,
        },
      );
      const sprints = await controller.listForTimeline(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        Timeline.THIS_QUARTER,
      );
      expect(sprints.length).toEqual(1);
      expect(sprints[0].goal).toEqual('Goal 1');
      expect(sprints[0].startDate).toEqual(currentDateAsString);
      expect(sprints[0].duration).toEqual(1);
    });
  });

  describe('when getting an sprint', () => {
    it('should get an sprint', async () => {
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: '2020-01-01',
          duration: 1,
        },
      );
      const foundSprint = await controller.get(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        sprint.id,
      );
      expect(foundSprint.goal).toEqual('Goal 1');
      expect(foundSprint.startDate).toEqual('2020-01-01');
      expect(foundSprint.duration).toEqual(1);
    });
  });

  describe('when updating an sprint', () => {
    it('should update an sprint', async () => {
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: '2020-01-01',
          duration: 1,
        },
      );
      const updatedSprint = await controller.update(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        sprint.id,
        {
          goal: 'Goal 2',
          startDate: '2020-01-02',
          duration: 2,
        },
      );
      expect(updatedSprint.goal).toEqual('Goal 2');
      expect(updatedSprint.startDate).toEqual('2020-01-02');
      expect(updatedSprint.duration).toEqual(2);
    });
  });
  describe('when deleting an sprint', () => {
    it('should delete an sprint', async () => {
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: '2020-01-01',
          duration: 1,
        },
      );
      await controller.delete(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        sprint.id,
      );
      const sprints = await controller.listWithWorkItems(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
      );
      expect(sprints.length).toEqual(0);
    });
  });
  describe('when starting an sprint', () => {
    it('should start an sprint', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: startDate,
          duration: 1,
        },
      );
      const startedSprint = await controller.startSprint(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        sprint.id,
      );
      expect(startedSprint.goal).toEqual('Goal 1');
      expect(startedSprint.startDate).toEqual(startDate);
      expect(startedSprint.actualStartDate).toBeDefined();
      expect(startedSprint.duration).toEqual(1);
      expect(startedSprint.status).toEqual('active');
    });
  });
  describe('when getting the active sprint', () => {
    it('should return the active sprint', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: startDate,
          duration: 1,
        },
      );
      await workItemService.createWorkItem(org.id, project.id, user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.READY_TO_START,
        sprint: sprint.id,
      });
      await controller.startSprint(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        sprint.id,
      );
      const activeSprint = await controller.getActiveSprint(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
      );
      expect(activeSprint.goal).toEqual('Goal 1');
      expect(activeSprint.startDate).toEqual(startDate);
      expect(activeSprint.duration).toEqual(1);
      expect(activeSprint.status).toEqual('active');
      expect(activeSprint.workItems.length).toEqual(1);
    });
  });
  describe('when completing an sprint', () => {
    it('should complete an sprint', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: startDate,
          duration: 1,
        },
      );
      await controller.startSprint(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        sprint.id,
      );
      const completedSprint = await controller.completeSprint(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        sprint.id,
      );
      expect(completedSprint.goal).toEqual('Goal 1');
      expect(completedSprint.startDate).toEqual(startDate);
      expect(completedSprint.duration).toEqual(1);
      expect(completedSprint.status).toEqual('completed');
    });
  });
  describe('when listing the sprints', () => {
    it('should return the sprints list without work items', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await controller.create(
        org.id,
        project.id,
        {
          user: { org: org.id },
        },
        {
          goal: 'Goal 1',
          startDate: startDate,
          duration: 1,
        },
      );
      const sprintsList = await controller.list(org.id, project.id, {
        user: { org: org.id },
      });
      expect(sprintsList.length).toEqual(1);
      expect(sprintsList[0].id).toEqual(sprint.id);
      expect(sprintsList[0].title).toEqual(sprint.title);
      expect(sprintsList[0].status).toEqual(sprint.status);
      expect(sprintsList[0].startDate).toEqual(sprint.startDate);
      expect(sprintsList[0].duration).toEqual(sprint.duration);
      expect(sprintsList[0].endDate).toEqual(sprint.endDate);
      expect(sprintsList[0].createdAt).toEqual(sprint.createdAt);
      expect(sprintsList[0].updatedAt).toEqual(sprint.updatedAt);
    });
  });
});
