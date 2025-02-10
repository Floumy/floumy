import { InitiativesService } from './initiatives.service';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { Org } from '../../orgs/org.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Initiative } from './initiative.entity';
import { UsersService } from '../../users/users.service';
import { Priority } from '../../common/priority.enum';
import { User } from '../../users/user.entity';
import { MilestonesService } from '../milestones/milestones.service';
import { Milestone } from '../milestones/milestone.entity';
import { WorkItemStatus } from '../../backlog/work-items/work-item-status.enum';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { WorkItemType } from '../../backlog/work-items/work-item-type.enum';
import { InitiativeStatus } from './initiativestatus.enum';
import { Sprint } from '../../sprints/sprint.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { InitiativeFile } from './initiative-file.entity';
import { InitiativeComment } from './initiative-comment.entity';
import { Repository } from 'typeorm';
import { PaymentPlan } from '../../auth/payment.plan';
import { FeatureRequest } from '../../feature-requests/feature-request.entity';
import { FeatureRequestsService } from '../../feature-requests/feature-requests.service';
import { FeatureRequestComment } from '../../feature-requests/feature-request-comment.entity';
import { FeatureRequestVote } from '../../feature-requests/feature-request-vote.entity';
import { Project } from '../../projects/project.entity';

describe('FeaturesService', () => {
  let usersService: UsersService;
  let service: InitiativesService;
  let workItemsService: WorkItemsService;
  let milestonesService: MilestonesService;
  let featureRequestsService: FeatureRequestsService;
  let okrsService: OkrsService;
  let orgsService: OrgsService;
  let filesService: FilesService;
  let orgsRepository: Repository<Org>;
  let user: User;
  let org: Org;
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
          InitiativeComment,
          FeatureRequest,
          FeatureRequestComment,
          FeatureRequestVote,
        ]),
      ],
      [
        OkrsService,
        OrgsService,
        InitiativesService,
        UsersService,
        MilestonesService,
        WorkItemsService,
        FilesService,
        FilesStorageRepository,
        FeatureRequestsService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<InitiativesService>(InitiativesService);
    usersService = module.get<UsersService>(UsersService);
    okrsService = module.get<OkrsService>(OkrsService);
    orgsService = module.get<OrgsService>(OrgsService);
    milestonesService = module.get<MilestonesService>(MilestonesService);
    workItemsService = module.get<WorkItemsService>(WorkItemsService);
    filesService = module.get<FilesService>(FilesService);
    orgsRepository = module.get(getRepositoryToken(Org));
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    featureRequestsService = module.get<FeatureRequestsService>(
      FeatureRequestsService,
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when creating a initiative', () => {
    it('should return a initiative', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      expect(initiative.id).toBeDefined();
      expect(initiative.title).toEqual('my initiative');
      expect(initiative.description).toEqual('my initiative description');
      expect(initiative.priority).toEqual(Priority.HIGH);
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(
        service.createInitiative('non-existent-org', project.id, user.id, {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should throw an error if the title is not provided', async () => {
      await expect(
        service.createInitiative(org.id, project.id, user.id, {
          title: '',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should throw an error if the priority is not provided', async () => {
      await expect(
        service.createInitiative(org.id, project.id, user.id, {
          title: 'my initiative',
          description: 'my initiative description',
          priority: null,
          status: InitiativeStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should create a initiative with a key result', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          keyResult: objective.keyResults[0].id,
          status: InitiativeStatus.PLANNED,
        },
      );
      expect(initiative.keyResult).toBeDefined();
      expect(initiative.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(initiative.keyResult.title).toEqual(objective.keyResults[0].title);
    });
    it('should throw an error if the key result does not exist', async () => {
      await expect(
        service.createInitiative(org.id, project.id, user.id, {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          keyResult: 'non-existent-key-result',
          status: InitiativeStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should throw an error if the key result does not belong to the org', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const otherUser = await usersService.createUserWithOrg(
        'Jane Doe',
        'jane.doe@example.com',
        'testtesttest',
      );
      await expect(
        service.createInitiative(org.id, project.id, otherUser.id, {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          keyResult: objective.keyResults[0].id,
          status: InitiativeStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should create a initiative with a milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          milestone: milestone.id,
          status: InitiativeStatus.PLANNED,
        },
      );
      expect(initiative.milestone).toBeDefined();
      expect(initiative.milestone.id).toEqual(milestone.id);
      expect(initiative.milestone.title).toEqual(milestone.title);
    });
    it('should create a initiative with files', async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);

      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          files: [file],
        },
      );

      expect(initiative.files).toBeDefined();
      expect(initiative.files.length).toEqual(1);
      expect(initiative.files[0].id).toEqual(file.id);
      expect(initiative.files[0].name).toEqual(file.name);
    });
    it('should create a initiative with assigned to', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Jane Doe',
        'jane.doe@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          assignedTo: otherUser.id,
        },
      );
      expect(initiative.assignedTo).toBeDefined();
      expect(initiative.assignedTo.id).toEqual(otherUser.id);
      expect(initiative.assignedTo.name).toEqual(otherUser.name);
    });
    it('should update the initiative request', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureRequest = await featureRequestsService.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );

      expect(initiative.featureRequest).toBeDefined();
      expect(initiative.featureRequest.id).toEqual(featureRequest.id);
    });
    it('should set the completedAt field if the status is completed', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.COMPLETED,
        },
      );
      expect(initiative.completedAt).not.toBeNull();
    });
  });
  describe('when listing initiatives', () => {
    it('should return a list of initiatives', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative',
        description: 'my initiative description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: InitiativeStatus.PLANNED,
      });
      const initiatives = await service.listInitiatives(org.id, project.id);
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].title).toEqual('my initiative');
      expect(initiatives[0].priority).toEqual(Priority.HIGH);
      expect(initiatives[0].createdAt).toBeDefined();
      expect(initiatives[0].updatedAt).toBeDefined();
    });
    it('should return the initiatives paginated', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative 1',
        description: 'my initiative description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: InitiativeStatus.PLANNED,
      });
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative 2',
        description: 'my initiative description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: InitiativeStatus.PLANNED,
      });
      const initiatives = await service.listInitiatives(
        org.id,
        project.id,
        1,
        1,
      );
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].title).toEqual('my initiative 2');
    });
  });
  describe('when listing initiatives without milestone', () => {
    it('should return a list of initiatives', async () => {
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative',
        description: 'my initiative description',
        priority: Priority.HIGH,
        status: InitiativeStatus.PLANNED,
      });
      const initiatives = await service.listInitiativesWithoutMilestone(
        org.id,
        project.id,
      );
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].title).toEqual('my initiative');
      expect(initiatives[0].priority).toEqual(Priority.HIGH);
      expect(initiatives[0].createdAt).toBeDefined();
      expect(initiatives[0].updatedAt).toBeDefined();
    });
    it('should not return initiatives with a milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative',
        description: 'my initiative description',
        priority: Priority.HIGH,
        milestone: milestone.id,
        status: InitiativeStatus.PLANNED,
      });
      const initiatives = await service.listInitiativesWithoutMilestone(
        org.id,
        project.id,
      );
      expect(initiatives.length).toEqual(0);
    });
    it('should not return initiatives that are closed or completed', async () => {
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative',
        description: 'my initiative description',
        priority: Priority.HIGH,
        status: InitiativeStatus.CLOSED,
      });
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative',
        description: 'my initiative description',
        priority: Priority.HIGH,
        status: InitiativeStatus.COMPLETED,
      });
      const initiatives = await service.listInitiativesWithoutMilestone(
        org.id,
        project.id,
      );
      expect(initiatives.length).toEqual(0);
    });
  });
  describe('when getting a initiative', () => {
    it('should return a initiative', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const foundFeature = await service.getInitiative(
        org.id,
        project.id,
        initiative.id,
      );
      expect(foundFeature.id).toEqual(initiative.id);
      expect(foundFeature.title).toEqual(initiative.title);
      expect(foundFeature.priority).toEqual(initiative.priority);
      expect(foundFeature.createdAt).toBeDefined();
      expect(foundFeature.updatedAt).toBeDefined();
    });
    it('should throw an error if the initiative does not exist', async () => {
      await expect(
        service.getInitiative(org.id, project.id, 'non-existent-initiative'),
      ).rejects.toThrowError();
    });
    it('should return the initiative with the key result', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          keyResult: objective.keyResults[0].id,
          status: InitiativeStatus.PLANNED,
        },
      );
      const foundFeature = await service.getInitiative(
        org.id,
        project.id,
        initiative.id,
      );
      expect(foundFeature.keyResult).toBeDefined();
      expect(foundFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(foundFeature.keyResult.title).toEqual(
        objective.keyResults[0].title,
      );
    });
    it('should return the initiative with the milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          milestone: milestone.id,
          status: InitiativeStatus.PLANNED,
        },
      );
      const foundFeature = await service.getInitiative(
        org.id,
        project.id,
        initiative.id,
      );
      expect(foundFeature.milestone).toBeDefined();
      expect(foundFeature.milestone.id).toEqual(milestone.id);
      expect(foundFeature.milestone.title).toEqual(milestone.title);
    });
  });
  describe('when updating a initiative', () => {
    it('should return a initiative', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.CLOSED,
        },
      );
      expect(updatedFeature.id).toEqual(initiative.id);
      expect(updatedFeature.title).toEqual('my updated initiative');
      expect(updatedFeature.description).toEqual(
        'my updated initiative description',
      );
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.CLOSED);
      expect(updatedFeature.createdAt).toEqual(initiative.createdAt);
      expect(updatedFeature.updatedAt).not.toEqual(initiative.updatedAt);
    });
    it('should update the initiative with a key result', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          keyResult: objective.keyResults[0].id,
          status: InitiativeStatus.PLANNED,
        },
      );
      expect(updatedFeature.keyResult).toBeDefined();
      expect(updatedFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(updatedFeature.keyResult.title).toEqual(
        objective.keyResults[0].title,
      );
    });
    it('should update the initiative with a milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          milestone: milestone.id,
          status: InitiativeStatus.PLANNED,
        },
      );
      expect(updatedFeature.milestone).toBeDefined();
      expect(updatedFeature.milestone.id).toEqual(milestone.id);
      expect(updatedFeature.milestone.title).toEqual(milestone.title);
    });
    it('should update the initiative with files', async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          files: [file],
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(1);
      expect(updatedFeature.files[0].id).toEqual(file.id);
      expect(updatedFeature.files[0].name).toEqual(file.name);
    });
    it('should update the initiative with assigned to', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Jane Doe',
        'jane.doe@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          assignedTo: otherUser.id,
        },
      );
      expect(updatedFeature.assignedTo).toBeDefined();
      expect(updatedFeature.assignedTo.id).toEqual(otherUser.id);
      expect(updatedFeature.assignedTo.name).toEqual(otherUser.name);
    });
    it('should update the initiative with assigned to to null', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Jane Doe',
        'jane.doe@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          assignedTo: otherUser.id,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          assignedTo: null,
        },
      );
      expect(updatedFeature.assignedTo).toBeUndefined();
    });
    it("should update the files of the initiative if the update doesn't include files", async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          files: [file],
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(0);
    });
    it('should update the files of the initiative if the update contains some files', async () => {
      const file1 = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file 1',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const file2 = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file 2',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          files: [file1],
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          files: [file2],
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(1);
      expect(updatedFeature.files[0].id).toEqual(file2.id);
      expect(updatedFeature.files[0].name).toEqual(file2.name);
    });
    it('should update the files of the initiative if the update contains the same files', async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          files: [file],
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my updated initiative',
          description: 'my updated initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          files: [file],
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(1);
      expect(updatedFeature.files[0].id).toEqual(file.id);
      expect(updatedFeature.files[0].name).toEqual(file.name);
    });
    it('should update the initiative request', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureRequest = await featureRequestsService.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.description).toEqual('my initiative description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeDefined();
      expect(updatedFeature.featureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeature.featureRequest.title).toEqual(featureRequest.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should update the feature request to null', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureRequest = await featureRequestsService.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          featureRequest: null,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.description).toEqual('my initiative description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeNull();
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should not update the feature request if the update is for another field', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureRequest = await featureRequestsService.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.description).toEqual('my initiative description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeDefined();
      expect(updatedFeature.featureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeature.featureRequest.title).toEqual(featureRequest.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should set the completedAt field if the status is completed', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.COMPLETED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.COMPLETED,
        },
      );
      expect(updatedFeature.completedAt).not.toBeNull();
    });
  });
  describe('when deleting a initiative', () => {
    it('should delete the initiative', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await service.deleteInitiative(org.id, project.id, initiative.id);
      await expect(
        service.getInitiative(org.id, project.id, initiative.id),
      ).rejects.toThrowError();
    });
    it('should remove the association between initiatives and work items', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const workItem = await workItemsService.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          initiative: initiative.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      await service.deleteInitiative(org.id, project.id, initiative.id);
      const foundWorkItem = await workItemsService.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(foundWorkItem.initiative).toBeUndefined();
    });
    it("should remove the association between initiatives and the initiative's files", async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
          files: [file],
        },
      );
      await service.deleteInitiative(org.id, project.id, initiative.id);
      await expect(
        filesService.getFile(org.id, project.id, file.id),
      ).rejects.toThrowError();
    });
  });
  describe('when patching a initiative', () => {
    it('should update the status', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          status: InitiativeStatus.CLOSED,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.HIGH);
      expect(updatedFeature.status).toEqual(InitiativeStatus.CLOSED);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should update the priority', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          priority: Priority.HIGH,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.HIGH);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should update the milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          milestone: milestone.id,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.milestone).toBeDefined();
      expect(updatedFeature.milestone.id).toEqual(milestone.id);
      expect(updatedFeature.milestone.title).toEqual(milestone.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should throw an error if the milestone does not exist', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      await expect(
        service.patchInitiative(org.id, project.id, initiative.id, {
          milestone: 'non-existent-milestone',
        }),
      ).rejects.toThrowError();
    });
    it('should throw an error if the milestone does not belong to the org', async () => {
      const otherOrg = await orgsService.createForUser(
        await usersService.createUserWithOrg(
          'Other User',
          'testing@example.com',
          'testtesttest',
        ),
      );
      const otherOrgProject = (await otherOrg.projects)[0];
      const milestone = await milestonesService.createMilestone(
        otherOrg.id,
        otherOrgProject.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      await expect(
        service.patchInitiative(org.id, project.id, initiative.id, {
          milestone: milestone.id,
        }),
      ).rejects.toThrowError();
    });
    it('should update milestones to null', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          milestone: milestone.id,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          milestone: null,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.milestone).toBeUndefined();
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should not update the milestone if the update is for another field', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          milestone: milestone.id,
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          status: InitiativeStatus.IN_PROGRESS,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.IN_PROGRESS);
      expect(updatedFeature.milestone).toBeDefined();
      expect(updatedFeature.milestone.id).toEqual(milestone.id);
      expect(updatedFeature.milestone.title).toEqual(milestone.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should update the key result', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          keyResult: objective.keyResults[0].id,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.keyResult).toBeDefined();
      expect(updatedFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(updatedFeature.keyResult.title).toEqual(
        objective.keyResults[0].title,
      );
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should throw an error if the key result does not exist', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      await expect(
        service.patchInitiative(org.id, project.id, initiative.id, {
          keyResult: 'non-existent-key-result',
        }),
      ).rejects.toThrowError();
    });
    it('should throw an error if the key result does not belong to the org', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const otherOrg = await orgsService.createForUser(
        await usersService.createUserWithOrg(
          'Other User',
          'testing@exmple.com',
          'testtesttest',
        ),
      );
      const otherOrgProject = (await otherOrg.projects)[0];
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      await expect(
        service.patchInitiative(
          otherOrg.id,
          otherOrgProject.id,
          initiative.id,
          {
            keyResult: objective.keyResults[0].id,
          },
        ),
      ).rejects.toThrowError();
    });
    it('should update the key result to null', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          keyResult: objective.keyResults[0].id,
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          keyResult: null,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.keyResult).toBeUndefined();
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should not update the key result if the update is for another field', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          keyResult: objective.keyResults[0].id,
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          status: InitiativeStatus.IN_PROGRESS,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.IN_PROGRESS);
      expect(updatedFeature.keyResult).toBeDefined();
      expect(updatedFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(updatedFeature.keyResult.title).toEqual(
        objective.keyResults[0].title,
      );
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should update the feature request', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureRequest = await featureRequestsService.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.description).toEqual('my initiative description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeDefined();
      expect(updatedFeature.featureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeature.featureRequest.title).toEqual(featureRequest.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should update the feature request to null', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      await featureRequestsService.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.updateInitiative(
        user.id,
        org.id,
        project.id,
        initiative.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          featureRequest: null,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.description).toEqual('my initiative description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeNull();
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should not update the feature request if the update is for another field', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureRequest = await featureRequestsService.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const updatedFeature = await service.patchInitiative(
        org.id,
        project.id,
        initiative.id,
        {
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my initiative');
      expect(updatedFeature.description).toEqual('my initiative description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(InitiativeStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeDefined();
      expect(updatedFeature.featureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeature.featureRequest.title).toEqual(featureRequest.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
  });
  describe('when searching initiatives', () => {
    it('should return a list of initiatives', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiatives = await service.searchInitiatives(
        org.id,
        project.id,
        'my initiative',
      );
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].id).toEqual(initiative.id);
      expect(initiatives[0].title).toEqual('my initiative');
      expect(initiatives[0].priority).toEqual(Priority.LOW);
      expect(initiatives[0].createdAt).toBeDefined();
      expect(initiatives[0].updatedAt).toBeDefined();
    });
    it('should return the initiatives paginated', async () => {
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative 1',
        description: 'my initiative description',
        priority: Priority.LOW,
        status: InitiativeStatus.PLANNED,
      });
      await service.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative 2',
        description: 'my initiative description',
        priority: Priority.LOW,
        status: InitiativeStatus.PLANNED,
      });
      const initiatives = await service.searchInitiatives(
        org.id,
        project.id,
        'my initiative',
        1,
        1,
      );
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].title).toEqual('my initiative 2');
    });
    it('should search initiatives by reference', async () => {
      const objective = await okrsService.create(org.id, project.id, {
        objective: {
          title: 'my objective',
        },
        keyResults: [
          {
            title: 'my key result',
          },
        ],
      });
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          keyResult: objective.keyResults[0].id,
          priority: Priority.LOW,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiatives = await service.searchInitiatives(
        org.id,
        project.id,
        initiative.reference,
      );
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].id).toEqual(initiative.id);
      expect(initiatives[0].title).toEqual('my initiative');
      expect(initiatives[0].priority).toEqual(Priority.LOW);
      expect(initiatives[0].createdAt).toBeDefined();
      expect(initiatives[0].updatedAt).toBeDefined();
    });
  });

  describe('when listing initiative comments', () => {
    it('should return a list of comments if the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await service.createInitiativeComment(user.id, initiative.id, {
        content: 'Test comment',
        mentions: [],
      });
      const comments = await service.listInitiativeComments(initiative.id);
      expect(comments).toBeDefined();
      expect(comments.length).toEqual(1);
      expect(comments[0].content).toEqual('Test comment');
    });
  });

  describe('when creating a initiative comment', () => {
    it('should create a comment if the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const comment = await service.createInitiativeComment(
        user.id,
        initiative.id,
        {
          content: 'Test comment',
          mentions: [user.id],
        },
      );
      expect(comment).toBeDefined();
      expect(comment.content).toEqual('Test comment');
    });
  });

  describe('when deleting a initiative comment', () => {
    it('should delete the comment if it exists', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const comment = await service.createInitiativeComment(
        user.id,
        initiative.id,
        {
          content: 'Test comment',
          mentions: [],
        },
      );
      await service.deleteInitiativeComment(user.id, initiative.id, comment.id);
      await expect(
        service.listInitiativeComments(initiative.id),
      ).resolves.toEqual([]);
    });

    it('should throw an error if the comment does not exist', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await expect(
        service.deleteInitiativeComment(
          user.id,
          initiative.id,
          'non-existent-comment-id',
        ),
      ).rejects.toThrowError();
    });
  });

  describe('when updating a initiative comment', () => {
    it('should update the comment if it exists and the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const comment = await service.createInitiativeComment(
        user.id,
        initiative.id,
        {
          content: 'Test comment',
          mentions: [],
        },
      );
      const updatedComment = await service.updateInitiativeComment(
        user.id,
        initiative.id,
        comment.id,
        {
          content: 'Updated comment',
          mentions: [user.id],
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.content).toEqual('Updated comment');
    });

    it('should throw an error if the comment does not exist', async () => {
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await expect(
        service.updateInitiativeComment(
          user.id,
          initiative.id,
          'non-existent-comment-id',
          {
            content: 'Updated comment',
            mentions: [],
          },
        ),
      ).rejects.toThrowError();
    });

    it('should throw an error if the comment content is empty', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiative = await service.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const comment = await service.createInitiativeComment(
        user.id,
        initiative.id,
        {
          content: 'Test comment',
          mentions: [],
        },
      );
      await expect(
        service.updateInitiativeComment(user.id, initiative.id, comment.id, {
          content: '',
          mentions: [],
        }),
      ).rejects.toThrowError('Comment content is required');
    });
  });
});
