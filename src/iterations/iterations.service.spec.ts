import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { FeaturesService } from '../roadmap/features/features.service';
import { Org } from '../orgs/org.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../okrs/objective.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { User } from '../users/user.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { OkrsService } from '../okrs/okrs.service';
import { MilestonesService } from '../roadmap/milestones/milestones.service';
import { IterationsService } from './iterations.service';
import { Iteration } from './Iteration.entity';
import { BacklogModule } from '../backlog/backlog.module';
import { WorkItemsService } from '../backlog/work-items/work-items.service';
import { Priority } from '../common/priority.enum';
import { WorkItemType } from '../backlog/work-items/work-item-type.enum';
import { WorkItemStatus } from '../backlog/work-items/work-item-status.enum';
import { File } from '../files/file.entity';
import { WorkItemFile } from '../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../roadmap/features/feature-file.entity';
import { FilesService } from '../files/files.service';
import { FilesStorageRepository } from '../files/files-storage.repository';
import { Timeline } from '../common/timeline.enum';
import { TimelineService } from '../common/timeline.service';
import { Product } from '../products/product.entity';

describe('IterationsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: IterationsService;
  let workItemsService: WorkItemsService;
  let org: Org;
  let user: User;
  let product: Product;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Feature,
          User,
          Milestone,
          WorkItem,
          Iteration,
          File,
          WorkItemFile,
          FeatureFile,
        ]),
        BacklogModule,
      ],
      [
        OkrsService,
        OrgsService,
        FeaturesService,
        UsersService,
        WorkItemsService,
        MilestonesService,
        IterationsService,
        FilesService,
        FilesStorageRepository,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<IterationsService>(IterationsService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    workItemsService = module.get<WorkItemsService>(WorkItemsService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    product = (await org.products)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when creating an iteration', () => {
    it('should create an iteration', async () => {
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2020-01-01',
        duration: 1,
      });
      expect(iteration).toBeDefined();
      expect(iteration.id).toBeDefined();
      expect(iteration.title).toEqual('Sprint CW1-CW2 2020');
      expect(iteration.goal).toEqual('Test Iteration');
      expect(iteration.startDate).toEqual('2020-01-01');
      expect(iteration.duration).toEqual(1);
      expect(iteration.endDate).toEqual('2020-01-07');
      expect(iteration.createdAt).toBeDefined();
      expect(iteration.updatedAt).toBeDefined();
    });
    it('should calculate the correct iteration title', async () => {
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2023-12-22',
        duration: 1,
      });
      expect(iteration.title).toEqual('Sprint CW51-CW52 2023');
    });
    it('should set the status to planned', async () => {
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2020-01-01',
        duration: 1,
      });
      expect(iteration.status).toEqual('planned');
    });
  });
  describe('when listing iterations', () => {
    it('should list iterations', async () => {
      await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2020-01-01',
        duration: 1,
      });
      const iterations = await service.listWithWorkItems(org.id, product.id);
      expect(iterations[0].id).toBeDefined();
      expect(iterations[0].title).toEqual('Sprint CW1-CW2 2020');
      expect(iterations[0].goal).toEqual('Test Iteration');
      expect(iterations[0].startDate).toEqual('2020-01-01');
      expect(iterations[0].endDate).toEqual('2020-01-07');
      expect(iterations[0].duration).toEqual(1);
      expect(iterations[0].createdAt).toBeDefined();
      expect(iterations[0].updatedAt).toBeDefined();
    });
  });
  describe('when getting an iteration', () => {
    it('should get an iteration', async () => {
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2020-01-01',
        duration: 1,
      });
      const foundIteration = await service.get(
        org.id,
        product.id,
        iteration.id,
      );
      expect(foundIteration.id).toBeDefined();
      expect(foundIteration.title).toEqual('Sprint CW1-CW2 2020');
      expect(foundIteration.goal).toEqual('Test Iteration');
      expect(foundIteration.startDate).toEqual('2020-01-01');
      expect(foundIteration.endDate).toEqual('2020-01-07');
      expect(foundIteration.duration).toEqual(1);
      expect(foundIteration.createdAt).toBeDefined();
      expect(foundIteration.updatedAt).toBeDefined();
    });
  });
  describe('when updating an iteration', () => {
    it('should update an iteration', async () => {
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2020-01-01',
        duration: 1,
      });
      const updatedIteration = await service.update(
        org.id,
        product.id,
        iteration.id,
        {
          goal: 'Updated Test Iteration',
          startDate: '2020-01-01',
          duration: 2,
        },
      );
      expect(updatedIteration.id).toBeDefined();
      expect(updatedIteration.title).toEqual('Sprint CW1-CW3 2020');
      expect(updatedIteration.goal).toEqual('Updated Test Iteration');
      expect(updatedIteration.startDate).toEqual('2020-01-01');
      expect(updatedIteration.endDate).toEqual('2020-01-14');
      expect(updatedIteration.duration).toEqual(2);
      expect(updatedIteration.createdAt).toBeDefined();
      expect(updatedIteration.updatedAt).toBeDefined();
    });
  });

  describe('when deleting an iteration', () => {
    it('should delete an iteration', async () => {
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2020-01-01',
        duration: 1,
      });
      await service.delete(org.id, product.id, iteration.id);
      const iterations = await service.listWithWorkItems(org.id, product.id);
      expect(iterations.length).toEqual(0);
    });
    it('should remove the iteration from the work items', async () => {
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: '2020-01-01',
        duration: 1,
      });
      const workItem = await workItemsService.createWorkItem(user.id, {
        title: 'Test Work Item',
        description: 'Test Work Item Description',
        priority: Priority.HIGH,
        type: WorkItemType.BUG,
        status: WorkItemStatus.PLANNED,
        estimation: 1,
        iteration: iteration.id,
      });
      await service.delete(org.id, product.id, iteration.id);
      const workItems = await workItemsService.getWorkItem(org.id, workItem.id);
      expect(workItems.iteration).toBeUndefined();
    });
  });

  describe('when starting an iteration', () => {
    it('should start an iteration', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: startDate,
        duration: 1,
      });
      const startedIteration = await service.startIteration(
        org.id,
        product.id,
        iteration.id,
      );
      expect(startedIteration.goal).toEqual('Test Iteration');
      expect(startedIteration.startDate).toEqual(startDate);
      expect(startedIteration.actualStartDate).toBeDefined();
      expect(startedIteration.duration).toEqual(1);
      expect(startedIteration.status).toEqual('active');
    });
    it('should complete the previous iteration', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const iteration1 = await service.create(org.id, product.id, {
        goal: 'Test Iteration 1',
        startDate: startDate,
        duration: 1,
      });
      await service.startIteration(org.id, product.id, iteration1.id);
      const iteration2 = await service.create(org.id, product.id, {
        goal: 'Test Iteration 2',
        startDate: startDate,
        duration: 1,
      });
      const startedIteration = await service.startIteration(
        org.id,
        product.id,
        iteration2.id,
      );
      const completedIteration = await service.get(
        org.id,
        product.id,
        iteration1.id,
      );
      expect(completedIteration.status).toEqual('completed');
      expect(completedIteration.actualEndDate).toBeDefined();
      expect(completedIteration.actualStartDate).toBeDefined();
      expect(startedIteration.goal).toEqual('Test Iteration 2');
      expect(startedIteration.startDate).toEqual(startDate);
      expect(startedIteration.actualStartDate).toBeDefined();
      expect(startedIteration.duration).toEqual(1);
      expect(startedIteration.status).toEqual('active');
    });
  });

  describe('when getting the active iteration', () => {
    it('should return the active iteration', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: startDate,
        duration: 1,
      });
      const workItem = await workItemsService.createWorkItem(user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        estimation: 1,
        iteration: iteration.id,
      });
      const startedIteration = await service.startIteration(
        org.id,
        product.id,
        iteration.id,
      );
      const activeIteration = await service.getActiveIteration(
        org.id,
        product.id,
      );
      expect(activeIteration.id).toEqual(startedIteration.id);
      expect(activeIteration.workItems.length).toEqual(1);
      expect(activeIteration.workItems[0].id).toEqual(workItem.id);
    });
    it('should return null if there is no active iteration', async () => {
      const activeIteration = await service.getActiveIteration(
        org.id,
        product.id,
      );
      expect(activeIteration).toBeNull();
    });
  });
  describe('when completing an iteration', () => {
    it('should complete an iteration', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: startDate,
        duration: 1,
      });
      const workItem = await workItemsService.createWorkItem(user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        estimation: 1,
        iteration: iteration.id,
      });
      const startedIteration = await service.startIteration(
        org.id,
        product.id,
        iteration.id,
      );
      const completedIteration = await service.completeIteration(
        org.id,
        product.id,
        startedIteration.id,
      );
      expect(completedIteration.id).toEqual(startedIteration.id);
      expect(completedIteration.workItems.length).toEqual(1);
      expect(completedIteration.workItems[0].id).toEqual(workItem.id);
      expect(completedIteration.status).toEqual('completed');
      expect(completedIteration.actualEndDate).toBeDefined();
    });
    it('should store the velocity', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: startDate,
        duration: 1,
      });
      await workItemsService.createWorkItem(user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        estimation: 10,
        iteration: iteration.id,
      });
      const startedIteration = await service.startIteration(
        org.id,
        product.id,
        iteration.id,
      );
      const completedIteration = await service.completeIteration(
        org.id,
        product.id,
        startedIteration.id,
      );
      expect(completedIteration.velocity).toEqual(10);
    });
    it('should handle the case when there is no estimation', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: startDate,
        duration: 1,
      });
      await workItemsService.createWorkItem(user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        iteration: iteration.id,
      });
      const startedIteration = await service.startIteration(
        org.id,
        product.id,
        iteration.id,
      );
      const completedIteration = await service.completeIteration(
        org.id,
        product.id,
        startedIteration.id,
      );
      expect(completedIteration.velocity).toEqual(0);
    });
    it('should handle the case when there is a mix of estimations', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const iteration = await service.create(org.id, product.id, {
        goal: 'Test Iteration',
        startDate: startDate,
        duration: 1,
      });
      await workItemsService.createWorkItem(user.id, {
        title: 'Work Item 1',
        description: 'Work Item 1',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        estimation: 10,
        iteration: iteration.id,
      });
      await workItemsService.createWorkItem(user.id, {
        title: 'Work Item 2',
        description: 'Work Item 2',
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED,
        iteration: iteration.id,
      });
      const startedIteration = await service.startIteration(
        org.id,
        product.id,
        iteration.id,
      );
      const completedIteration = await service.completeIteration(
        org.id,
        product.id,
        startedIteration.id,
      );
      expect(completedIteration.velocity).toEqual(10);
    });
  });
  describe('when listing iterations', () => {
    it('should list iterations', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 1',
        startDate: startDate,
        duration: 1,
      });
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 2',
        startDate: startDate,
        duration: 1,
      });
      const iterations = await service.list(org.id, product.id);
      expect(iterations.length).toEqual(2);
      expect(iterations[0].id).toBeDefined();
      expect(iterations[0].title).toBeDefined();
      expect(iterations[0].goal).toEqual('Test Iteration 1');
      expect(iterations[0].startDate).toEqual(startDate);
      expect(iterations[0].endDate).toBeDefined();
      expect(iterations[0].duration).toEqual(1);
      expect(iterations[0].createdAt).toBeDefined();
      expect(iterations[0].updatedAt).toBeDefined();
      expect(iterations[1].id).toBeDefined();
      expect(iterations[1].title).toBeDefined();
      expect(iterations[1].goal).toEqual('Test Iteration 2');
      expect(iterations[1].startDate).toEqual(startDate);
      expect(iterations[1].endDate).toBeDefined();
      expect(iterations[1].duration).toEqual(1);
      expect(iterations[1].createdAt).toBeDefined();
      expect(iterations[1].updatedAt).toBeDefined();
    });
  });

  describe('when listing iterations for a specific timeline', () => {
    it('should list iterations for the past', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 1',
        startDate: '2020-01-01',
        duration: 1,
      });
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 2',
        startDate: startDate,
        duration: 1,
      });
      const iterations = await service.listForTimeline(
        org.id,
        product.id,
        Timeline.PAST,
      );
      expect(iterations.length).toEqual(1);
    });
    it('should list iterations for this quarter', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 1',
        startDate: startDate,
        duration: 1,
      });
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 2',
        startDate: startDate,
        duration: 1,
      });
      const iterations = await service.listForTimeline(
        org.id,
        product.id,
        Timeline.THIS_QUARTER,
      );
      expect(iterations.length).toEqual(2);
    });
    it('should list iterations for the next quarter', async () => {
      const { startDate } = TimelineService.getStartAndEndDatesByTimelineValue(
        Timeline.NEXT_QUARTER.valueOf(),
      );
      startDate.setDate(startDate.getDate() + 1);
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 1',
        startDate: startDate.toISOString().split('T')[0],
        duration: 1,
      });
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 2',
        startDate: '2020-01-01',
        duration: 1,
      });
      const iterations = await service.listForTimeline(
        org.id,
        product.id,
        Timeline.NEXT_QUARTER,
      );
      expect(iterations.length).toEqual(1);
    });
    it('should list iterations for later', async () => {
      const futureDate = TimelineService.calculateQuarterDates(
        TimelineService.getCurrentQuarter() + 4,
      ).startDate;
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 1',
        startDate: futureDate.toISOString().split('T')[0],
        duration: 1,
      });
      await service.create(org.id, product.id, {
        goal: 'Test Iteration 2',
        startDate: futureDate.toISOString().split('T')[0],
        duration: 1,
      });
      const iterations = await service.listForTimeline(
        org.id,
        product.id,
        Timeline.LATER,
      );
      expect(iterations.length).toEqual(2);
    });
  });
});
