import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { InitiativesService } from '../roadmap/initiatives/initiatives.service';
import { Org } from '../orgs/org.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../okrs/objective.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { User } from '../users/user.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { OkrsService } from '../okrs/okrs.service';
import { MilestonesService } from '../roadmap/milestones/milestones.service';
import { SprintsService } from './sprints.service';
import { Sprint } from './sprint.entity';
import { BacklogModule } from '../backlog/backlog.module';
import { WorkItemsService } from '../backlog/work-items/work-items.service';
import { Priority } from '../common/priority.enum';
import { WorkItemType } from '../backlog/work-items/work-item-type.enum';
import { WorkItemStatus } from '../backlog/work-items/work-item-status.enum';
import { File } from '../files/file.entity';
import { WorkItemFile } from '../backlog/work-items/work-item-file.entity';
import { InitiativeFile } from '../roadmap/initiatives/initiative-file.entity';
import { FilesService } from '../files/files.service';
import { FilesStorageRepository } from '../files/files-storage.repository';
import { Timeline } from '../common/timeline.enum';
import { TimelineService } from '../common/timeline.service';
import { Project } from '../projects/project.entity';

describe('SprintsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: SprintsService;
  let workItemsService: WorkItemsService;
  let org: Org;
  let user: User;
  let project: Project;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Initiative,
          User,
          Milestone,
          WorkItem,
          Sprint,
          File,
          WorkItemFile,
          InitiativeFile,
        ]),
        BacklogModule,
      ],
      [
        OkrsService,
        OrgsService,
        InitiativesService,
        UsersService,
        WorkItemsService,
        MilestonesService,
        SprintsService,
        FilesService,
        FilesStorageRepository,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<SprintsService>(SprintsService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    workItemsService = module.get<WorkItemsService>(WorkItemsService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when creating an sprint', () => {
    it('should create an sprint', async () => {
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2020-01-01',
        duration: 1,
      });
      expect(sprint).toBeDefined();
      expect(sprint.id).toBeDefined();
      expect(sprint.title).toEqual('Sprint CW1-CW2 2020');
      expect(sprint.goal).toEqual('Test Sprint');
      expect(sprint.startDate).toEqual('2020-01-01');
      expect(sprint.duration).toEqual(1);
      expect(sprint.endDate).toEqual('2020-01-07');
      expect(sprint.createdAt).toBeDefined();
      expect(sprint.updatedAt).toBeDefined();
    });
    it('should calculate the correct sprint title', async () => {
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2023-12-22',
        duration: 1,
      });
      expect(sprint.title).toEqual('Sprint CW51-CW52 2023');
      const sprint2 = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2024-12-15',
        duration: 3,
      });
      expect(sprint2.title).toEqual('Sprint CW50-CW1 2025');
    });
    it('should set the status to planned', async () => {
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2020-01-01',
        duration: 1,
      });
      expect(sprint.status).toEqual('planned');
    });
  });
  describe('when listing sprints', () => {
    it('should list sprints', async () => {
      await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2020-01-01',
        duration: 1,
      });
      const sprints = await service.listWithWorkItems(org.id, project.id);
      expect(sprints[0].id).toBeDefined();
      expect(sprints[0].title).toEqual('Sprint CW1-CW2 2020');
      expect(sprints[0].goal).toEqual('Test Sprint');
      expect(sprints[0].startDate).toEqual('2020-01-01');
      expect(sprints[0].endDate).toEqual('2020-01-07');
      expect(sprints[0].duration).toEqual(1);
      expect(sprints[0].createdAt).toBeDefined();
      expect(sprints[0].updatedAt).toBeDefined();
    });
  });
  describe('when getting an sprint', () => {
    it('should get an sprint', async () => {
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2020-01-01',
        duration: 1,
      });
      const foundSprint = await service.get(
        org.id,
        project.id,
        sprint.id,
      );
      expect(foundSprint.id).toBeDefined();
      expect(foundSprint.title).toEqual('Sprint CW1-CW2 2020');
      expect(foundSprint.goal).toEqual('Test Sprint');
      expect(foundSprint.startDate).toEqual('2020-01-01');
      expect(foundSprint.endDate).toEqual('2020-01-07');
      expect(foundSprint.duration).toEqual(1);
      expect(foundSprint.createdAt).toBeDefined();
      expect(foundSprint.updatedAt).toBeDefined();
    });
  });
  describe('when updating an sprint', () => {
    it('should update an sprint', async () => {
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2020-01-01',
        duration: 1,
      });
      const updatedSprint = await service.update(
        org.id,
        project.id,
        sprint.id,
        {
          goal: 'Updated Test Sprint',
          startDate: '2020-01-01',
          duration: 2,
        },
      );
      expect(updatedSprint.id).toBeDefined();
      expect(updatedSprint.title).toEqual('Sprint CW1-CW3 2020');
      expect(updatedSprint.goal).toEqual('Updated Test Sprint');
      expect(updatedSprint.startDate).toEqual('2020-01-01');
      expect(updatedSprint.endDate).toEqual('2020-01-14');
      expect(updatedSprint.duration).toEqual(2);
      expect(updatedSprint.createdAt).toBeDefined();
      expect(updatedSprint.updatedAt).toBeDefined();
    });
  });

  describe('when deleting an sprint', () => {
    it('should delete an sprint', async () => {
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2020-01-01',
        duration: 1,
      });
      await service.delete(org.id, project.id, sprint.id);
      const sprints = await service.listWithWorkItems(org.id, project.id);
      expect(sprints.length).toEqual(0);
    });
    it('should remove the sprint from the work items', async () => {
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: '2020-01-01',
        duration: 1,
      });
      const workItem = await workItemsService.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test Work Item',
          description: 'Test Work Item Description',
          priority: Priority.HIGH,
          type: WorkItemType.BUG,
          status: WorkItemStatus.PLANNED,
          estimation: 1,
          sprint: sprint.id,
        },
      );
      await service.delete(org.id, project.id, sprint.id);
      const workItems = await workItemsService.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(workItems.sprint).toBeUndefined();
    });
  });

  describe('when starting an sprint', () => {
    it('should start an sprint', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: startDate,
        duration: 1,
      });
      const startedSprint = await service.startSprint(
        org.id,
        project.id,
        sprint.id,
      );
      expect(startedSprint.goal).toEqual('Test Sprint');
      expect(startedSprint.startDate).toEqual(startDate);
      expect(startedSprint.actualStartDate).toBeDefined();
      expect(startedSprint.duration).toEqual(1);
      expect(startedSprint.status).toEqual('active');
    });
    it('should complete the previous sprint', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint1 = await service.create(org.id, project.id, {
        goal: 'Test Sprint 1',
        startDate: startDate,
        duration: 1,
      });
      await service.startSprint(org.id, project.id, sprint1.id);
      const sprint2 = await service.create(org.id, project.id, {
        goal: 'Test Sprint 2',
        startDate: startDate,
        duration: 1,
      });
      const startedSprint = await service.startSprint(
        org.id,
        project.id,
        sprint2.id,
      );
      const completedSprint = await service.get(
        org.id,
        project.id,
        sprint1.id,
      );
      expect(completedSprint.status).toEqual('completed');
      expect(completedSprint.actualEndDate).toBeDefined();
      expect(completedSprint.actualStartDate).toBeDefined();
      expect(startedSprint.goal).toEqual('Test Sprint 2');
      expect(startedSprint.startDate).toEqual(startDate);
      expect(startedSprint.actualStartDate).toBeDefined();
      expect(startedSprint.duration).toEqual(1);
      expect(startedSprint.status).toEqual('active');
    });
  });

  describe('when getting the active sprint', () => {
    it('should return the active sprint', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: startDate,
        duration: 1,
      });
      const workItem = await workItemsService.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'Work Item 1',
          description: 'Work Item 1',
          priority: Priority.LOW,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
          estimation: 1,
          sprint: sprint.id,
        },
      );
      const startedSprint = await service.startSprint(
        org.id,
        project.id,
        sprint.id,
      );
      const activeSprint = await service.getActiveSprint(
        org.id,
        project.id,
      );
      expect(activeSprint.id).toEqual(startedSprint.id);
      expect(activeSprint.workItems.length).toEqual(1);
      expect(activeSprint.workItems[0].id).toEqual(workItem.id);
    });
    it('should return null if there is no active sprint', async () => {
      const activeSprint = await service.getActiveSprint(
        org.id,
        project.id,
      );
      expect(activeSprint).toBeNull();
    });
  });
  describe('when completing an sprint', () => {
    it('should complete an sprint', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: startDate,
        duration: 1,
      });
      const workItem = await workItemsService.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'Work Item 1',
          description: 'Work Item 1',
          priority: Priority.LOW,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
          estimation: 1,
          sprint: sprint.id,
        },
      );
      const startedSprint = await service.startSprint(
        org.id,
        project.id,
        sprint.id,
      );
      const completedSprint = await service.completeSprint(
        org.id,
        project.id,
        startedSprint.id,
      );
      expect(completedSprint.id).toEqual(startedSprint.id);
      expect(completedSprint.workItems.length).toEqual(1);
      expect(completedSprint.workItems[0].id).toEqual(workItem.id);
      expect(completedSprint.status).toEqual('completed');
      expect(completedSprint.actualEndDate).toBeDefined();
    });
    it('should store the velocity', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: startDate,
        duration: 1,
      });
      await workItemsService.createWorkItem(org.id, project.id, user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        estimation: 10,
        sprint: sprint.id,
      });
      const startedSprint = await service.startSprint(
        org.id,
        project.id,
        sprint.id,
      );
      const completedSprint = await service.completeSprint(
        org.id,
        project.id,
        startedSprint.id,
      );
      expect(completedSprint.velocity).toEqual(10);
    });
    it('should handle the case when there is no estimation', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: startDate,
        duration: 1,
      });
      await workItemsService.createWorkItem(org.id, project.id, user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        sprint: sprint.id,
      });
      const startedSprint = await service.startSprint(
        org.id,
        project.id,
        sprint.id,
      );
      const completedSprint = await service.completeSprint(
        org.id,
        project.id,
        startedSprint.id,
      );
      expect(completedSprint.velocity).toEqual(0);
    });
    it('should handle the case when there is a mix of estimations', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const sprint = await service.create(org.id, project.id, {
        goal: 'Test Sprint',
        startDate: startDate,
        duration: 1,
      });
      await workItemsService.createWorkItem(org.id, project.id, user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        estimation: 10,
        sprint: sprint.id,
      });
      await workItemsService.createWorkItem(org.id, project.id, user.id, {
        title: 'Work Item 2',
        description: 'Work Item 2',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        sprint: sprint.id,
      });
      const startedSprint = await service.startSprint(
        org.id,
        project.id,
        sprint.id,
      );
      const completedSprint = await service.completeSprint(
        org.id,
        project.id,
        startedSprint.id,
      );
      expect(completedSprint.velocity).toEqual(10);
    });
  });
  describe('when listing sprints', () => {
    it('should list sprints', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 1',
        startDate: startDate,
        duration: 1,
      });
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 2',
        startDate: startDate,
        duration: 1,
      });
      const sprints = await service.list(org.id, project.id);
      expect(sprints.length).toEqual(2);
      expect(sprints[0].id).toBeDefined();
      expect(sprints[0].title).toBeDefined();
      expect(sprints[0].goal).toEqual('Test Sprint 1');
      expect(sprints[0].startDate).toEqual(startDate);
      expect(sprints[0].endDate).toBeDefined();
      expect(sprints[0].duration).toEqual(1);
      expect(sprints[0].createdAt).toBeDefined();
      expect(sprints[0].updatedAt).toBeDefined();
      expect(sprints[1].id).toBeDefined();
      expect(sprints[1].title).toBeDefined();
      expect(sprints[1].goal).toEqual('Test Sprint 2');
      expect(sprints[1].startDate).toEqual(startDate);
      expect(sprints[1].endDate).toBeDefined();
      expect(sprints[1].duration).toEqual(1);
      expect(sprints[1].createdAt).toBeDefined();
      expect(sprints[1].updatedAt).toBeDefined();
    });
  });

  describe('when listing sprints for a specific timeline', () => {
    it('should list sprints for the past', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 1',
        startDate: '2020-01-01',
        duration: 1,
      });
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 2',
        startDate: startDate,
        duration: 1,
      });
      const sprints = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.PAST,
      );
      expect(sprints.length).toEqual(1);
    });
    it('should list sprints for this quarter', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 1',
        startDate: startDate,
        duration: 1,
      });
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 2',
        startDate: startDate,
        duration: 1,
      });
      const sprints = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(sprints.length).toEqual(2);
    });
    it('should list sprints for the next quarter', async () => {
      const { startDate } = TimelineService.getStartAndEndDatesByTimelineValue(
        Timeline.NEXT_QUARTER.valueOf(),
      );
      startDate.setDate(startDate.getDate() + 1);
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 1',
        startDate: startDate.toISOString().split('T')[0],
        duration: 1,
      });
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 2',
        startDate: '2020-01-01',
        duration: 1,
      });
      const sprints = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.NEXT_QUARTER,
      );
      expect(sprints.length).toEqual(1);
    });
    it('should list sprints for later', async () => {
      const futureDate = TimelineService.calculateQuarterDates(
        TimelineService.getCurrentQuarter() + 4,
      ).startDate;
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 1',
        startDate: futureDate.toISOString().split('T')[0],
        duration: 1,
      });
      await service.create(org.id, project.id, {
        goal: 'Test Sprint 2',
        startDate: futureDate.toISOString().split('T')[0],
        duration: 1,
      });
      const sprints = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.LATER,
      );
      expect(sprints.length).toEqual(2);
    });
  });
});
