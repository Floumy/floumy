import { FeaturesService } from './features.service';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { Org } from '../../orgs/org.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Feature } from './feature.entity';
import { UsersService } from '../../users/users.service';
import { Priority } from '../../common/priority.enum';
import { User } from '../../users/user.entity';
import { MilestonesService } from '../milestones/milestones.service';
import { Milestone } from '../milestones/milestone.entity';
import { WorkItemStatus } from '../../backlog/work-items/work-item-status.enum';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { WorkItemType } from '../../backlog/work-items/work-item-type.enum';
import { FeatureStatus } from './featurestatus.enum';
import { Iteration } from '../../iterations/Iteration.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { FeatureFile } from './feature-file.entity';
import { FeatureComment } from './feature-comment.entity';
import { Repository } from 'typeorm';
import { PaymentPlan } from '../../auth/payment.plan';
import { FeatureRequest } from '../../feature-requests/feature-request.entity';
import { FeatureRequestsService } from '../../feature-requests/feature-requests.service';
import { FeatureRequestComment } from '../../feature-requests/feature-request-comment.entity';
import { FeatureRequestVote } from '../../feature-requests/feature-request-vote.entity';
import { Project } from '../../projects/project.entity';

describe('FeaturesService', () => {
  let usersService: UsersService;
  let service: FeaturesService;
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
          Feature,
          User,
          Milestone,
          WorkItem,
          Iteration,
          File,
          WorkItemFile,
          FeatureFile,
          FeatureComment,
          FeatureRequest,
          FeatureRequestComment,
          FeatureRequestVote,
        ]),
      ],
      [
        OkrsService,
        OrgsService,
        FeaturesService,
        UsersService,
        MilestonesService,
        WorkItemsService,
        FilesService,
        FilesStorageRepository,
        FeatureRequestsService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<FeaturesService>(FeaturesService);
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

  describe('when creating a feature', () => {
    it('should return a feature', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      expect(feature.id).toBeDefined();
      expect(feature.title).toEqual('my feature');
      expect(feature.description).toEqual('my feature description');
      expect(feature.priority).toEqual(Priority.HIGH);
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(
        service.createFeature('non-existent-org', project.id, user.id, {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should throw an error if the title is not provided', async () => {
      await expect(
        service.createFeature(org.id, project.id, user.id, {
          title: '',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should throw an error if the priority is not provided', async () => {
      await expect(
        service.createFeature(org.id, project.id, user.id, {
          title: 'my feature',
          description: 'my feature description',
          priority: null,
          status: FeatureStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should create a feature with a key result', async () => {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: FeatureStatus.PLANNED,
      });
      expect(feature.keyResult).toBeDefined();
      expect(feature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(feature.keyResult.title).toEqual(objective.keyResults[0].title);
    });
    it('should throw an error if the key result does not exist', async () => {
      await expect(
        service.createFeature(org.id, project.id, user.id, {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          keyResult: 'non-existent-key-result',
          status: FeatureStatus.PLANNED,
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
        service.createFeature(org.id, project.id, otherUser.id, {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          keyResult: objective.keyResults[0].id,
          status: FeatureStatus.PLANNED,
        }),
      ).rejects.toThrowError();
    });
    it('should create a feature with a milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        milestone: milestone.id,
        status: FeatureStatus.PLANNED,
      });
      expect(feature.milestone).toBeDefined();
      expect(feature.milestone.id).toEqual(milestone.id);
      expect(feature.milestone.title).toEqual(milestone.title);
    });
    it('should create a feature with files', async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);

      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        files: [file],
      });

      expect(feature.files).toBeDefined();
      expect(feature.files.length).toEqual(1);
      expect(feature.files[0].id).toEqual(file.id);
      expect(feature.files[0].name).toEqual(file.name);
    });
    it('should create a feature with assigned to', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Jane Doe',
        'jane.doe@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        assignedTo: otherUser.id,
      });
      expect(feature.assignedTo).toBeDefined();
      expect(feature.assignedTo.id).toEqual(otherUser.id);
      expect(feature.assignedTo.name).toEqual(otherUser.name);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        featureRequest: featureRequest.id,
      });

      expect(feature.featureRequest).toBeDefined();
      expect(feature.featureRequest.id).toEqual(featureRequest.id);
    });
    it('should set the completedAt field if the status is completed', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.COMPLETED,
      });
      expect(feature.completedAt).not.toBeNull();
    });
  });
  describe('when listing features', () => {
    it('should return a list of features', async () => {
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
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: FeatureStatus.PLANNED,
      });
      const features = await service.listFeatures(org.id, project.id);
      expect(features.length).toEqual(1);
      expect(features[0].title).toEqual('my feature');
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
    it('should return the features paginated', async () => {
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
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature 1',
        description: 'my feature description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: FeatureStatus.PLANNED,
      });
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature 2',
        description: 'my feature description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: FeatureStatus.PLANNED,
      });
      const features = await service.listFeatures(org.id, project.id, 1, 1);
      expect(features.length).toEqual(1);
      expect(features[0].title).toEqual('my feature 2');
    });
  });
  describe('when listing features without milestone', () => {
    it('should return a list of features', async () => {
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const features = await service.listFeaturesWithoutMilestone(
        org.id,
        project.id,
      );
      expect(features.length).toEqual(1);
      expect(features[0].title).toEqual('my feature');
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
    it('should not return features with a milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        milestone: milestone.id,
        status: FeatureStatus.PLANNED,
      });
      const features = await service.listFeaturesWithoutMilestone(
        org.id,
        project.id,
      );
      expect(features.length).toEqual(0);
    });
    it('should not return features that are closed or completed', async () => {
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.CLOSED,
      });
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.COMPLETED,
      });
      const features = await service.listFeaturesWithoutMilestone(
        org.id,
        project.id,
      );
      expect(features.length).toEqual(0);
    });
  });
  describe('when getting a feature', () => {
    it('should return a feature', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const foundFeature = await service.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.id).toEqual(feature.id);
      expect(foundFeature.title).toEqual(feature.title);
      expect(foundFeature.priority).toEqual(feature.priority);
      expect(foundFeature.createdAt).toBeDefined();
      expect(foundFeature.updatedAt).toBeDefined();
    });
    it('should throw an error if the feature does not exist', async () => {
      await expect(
        service.getFeature(org.id, project.id, 'non-existent-feature'),
      ).rejects.toThrowError();
    });
    it('should return the feature with the key result', async () => {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id,
        status: FeatureStatus.PLANNED,
      });
      const foundFeature = await service.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.keyResult).toBeDefined();
      expect(foundFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(foundFeature.keyResult.title).toEqual(
        objective.keyResults[0].title,
      );
    });
    it('should return the feature with the milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        milestone: milestone.id,
        status: FeatureStatus.PLANNED,
      });
      const foundFeature = await service.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.milestone).toBeDefined();
      expect(foundFeature.milestone.id).toEqual(milestone.id);
      expect(foundFeature.milestone.title).toEqual(milestone.title);
    });
  });
  describe('when updating a feature', () => {
    it('should return a feature', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.CLOSED,
        },
      );
      expect(updatedFeature.id).toEqual(feature.id);
      expect(updatedFeature.title).toEqual('my updated feature');
      expect(updatedFeature.description).toEqual(
        'my updated feature description',
      );
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.CLOSED);
      expect(updatedFeature.createdAt).toEqual(feature.createdAt);
      expect(updatedFeature.updatedAt).not.toEqual(feature.updatedAt);
    });
    it('should update the feature with a key result', async () => {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          keyResult: objective.keyResults[0].id,
          status: FeatureStatus.PLANNED,
        },
      );
      expect(updatedFeature.keyResult).toBeDefined();
      expect(updatedFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(updatedFeature.keyResult.title).toEqual(
        objective.keyResults[0].title,
      );
    });
    it('should update the feature with a milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          milestone: milestone.id,
          status: FeatureStatus.PLANNED,
        },
      );
      expect(updatedFeature.milestone).toBeDefined();
      expect(updatedFeature.milestone.id).toEqual(milestone.id);
      expect(updatedFeature.milestone.title).toEqual(milestone.title);
    });
    it('should update the feature with files', async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          files: [file],
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(1);
      expect(updatedFeature.files[0].id).toEqual(file.id);
      expect(updatedFeature.files[0].name).toEqual(file.name);
    });
    it('should update the feature with assigned to', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Jane Doe',
        'jane.doe@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          assignedTo: otherUser.id,
        },
      );
      expect(updatedFeature.assignedTo).toBeDefined();
      expect(updatedFeature.assignedTo.id).toEqual(otherUser.id);
      expect(updatedFeature.assignedTo.name).toEqual(otherUser.name);
    });
    it('should update the feature with assigned to to null', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Jane Doe',
        'jane.doe@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        assignedTo: otherUser.id,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          assignedTo: null,
        },
      );
      expect(updatedFeature.assignedTo).toBeUndefined();
    });
    it("should update the files of the feature if the update doesn't include files", async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        files: [file],
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(0);
    });
    it('should update the files of the feature if the update contains some files', async () => {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        files: [file1],
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          files: [file2],
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(1);
      expect(updatedFeature.files[0].id).toEqual(file2.id);
      expect(updatedFeature.files[0].name).toEqual(file2.name);
    });
    it('should update the files of the feature if the update contains the same files', async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        files: [file],
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my updated feature',
          description: 'my updated feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          files: [file],
        },
      );
      expect(updatedFeature.files).toBeDefined();
      expect(updatedFeature.files.length).toEqual(1);
      expect(updatedFeature.files[0].id).toEqual(file.id);
      expect(updatedFeature.files[0].name).toEqual(file.name);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my feature',
          description: 'my feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.description).toEqual('my feature description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
        featureRequest: featureRequest.id,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my feature',
          description: 'my feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          featureRequest: null,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.description).toEqual('my feature description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my feature',
          description: 'my feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.description).toEqual('my feature description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeDefined();
      expect(updatedFeature.featureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeature.featureRequest.title).toEqual(featureRequest.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should set the completedAt field if the status is completed', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.COMPLETED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my feature',
          description: 'my feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.COMPLETED,
        },
      );
      expect(updatedFeature.completedAt).not.toBeNull();
    });
  });
  describe('when deleting a feature', () => {
    it('should delete the feature', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      await service.deleteFeature(org.id, project.id, feature.id);
      await expect(
        service.getFeature(org.id, project.id, feature.id),
      ).rejects.toThrowError();
    });
    it('should remove the association between features and work items', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const workItem = await workItemsService.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      await service.deleteFeature(org.id, project.id, feature.id);
      const foundWorkItem = await workItemsService.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(foundWorkItem.feature).toBeUndefined();
    });
    it("should remove the association between features and the feature's files", async () => {
      const file = await filesService.uploadFile(org.id, project.id, {
        originalname: 'my file',
        buffer: Buffer.from('file content'),
        size: 100,
        mimetype: 'text/plain',
      } as any);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
        files: [file],
      });
      await service.deleteFeature(org.id, project.id, feature.id);
      await expect(
        filesService.getFile(org.id, project.id, file.id),
      ).rejects.toThrowError();
    });
  });
  describe('when patching a feature', () => {
    it('should update the status', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          status: FeatureStatus.CLOSED,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.HIGH);
      expect(updatedFeature.status).toEqual(FeatureStatus.CLOSED);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should update the priority', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          priority: Priority.HIGH,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.HIGH);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          milestone: milestone.id,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
      expect(updatedFeature.milestone).toBeDefined();
      expect(updatedFeature.milestone.id).toEqual(milestone.id);
      expect(updatedFeature.milestone.title).toEqual(milestone.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should throw an error if the milestone does not exist', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      await expect(
        service.patchFeature(org.id, project.id, feature.id, {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      await expect(
        service.patchFeature(org.id, project.id, feature.id, {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        milestone: milestone.id,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          milestone: null,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        milestone: milestone.id,
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.IN_PROGRESS);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          keyResult: objective.keyResults[0].id,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
      expect(updatedFeature.keyResult).toBeDefined();
      expect(updatedFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(updatedFeature.keyResult.title).toEqual(
        objective.keyResults[0].title,
      );
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
    it('should throw an error if the key result does not exist', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      await expect(
        service.patchFeature(org.id, project.id, feature.id, {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      await expect(
        service.patchFeature(otherOrg.id, otherOrgProject.id, feature.id, {
          keyResult: objective.keyResults[0].id,
        }),
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        keyResult: objective.keyResults[0].id,
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          keyResult: null,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        keyResult: objective.keyResults[0].id,
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.IN_PROGRESS);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.description).toEqual('my feature description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.updateFeature(
        org.id,
        project.id,
        feature.id,
        {
          title: 'my feature',
          description: 'my feature description',
          mentions: [user.id],
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          featureRequest: null,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.description).toEqual('my feature description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const updatedFeature = await service.patchFeature(
        org.id,
        project.id,
        feature.id,
        {
          priority: Priority.LOW,
          status: FeatureStatus.PLANNED,
          featureRequest: featureRequest.id,
        },
      );
      expect(updatedFeature.title).toEqual('my feature');
      expect(updatedFeature.description).toEqual('my feature description');
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.status).toEqual(FeatureStatus.PLANNED);
      expect(updatedFeature.featureRequest).toBeDefined();
      expect(updatedFeature.featureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeature.featureRequest.title).toEqual(featureRequest.title);
      expect(updatedFeature.createdAt).toBeDefined();
      expect(updatedFeature.updatedAt).toBeDefined();
    });
  });
  describe('when searching features', () => {
    it('should return a list of features', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const features = await service.searchFeatures(
        org.id,
        project.id,
        'my feature',
      );
      expect(features.length).toEqual(1);
      expect(features[0].id).toEqual(feature.id);
      expect(features[0].title).toEqual('my feature');
      expect(features[0].priority).toEqual(Priority.LOW);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
    it('should return the features paginated', async () => {
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature 1',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature 2',
        description: 'my feature description',
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const features = await service.searchFeatures(
        org.id,
        project.id,
        'my feature',
        1,
        1,
      );
      expect(features.length).toEqual(1);
      expect(features[0].title).toEqual('my feature 2');
    });
    it('should search features by reference', async () => {
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'my feature',
        description: 'my feature description',
        keyResult: objective.keyResults[0].id,
        priority: Priority.LOW,
        status: FeatureStatus.PLANNED,
      });
      const features = await service.searchFeatures(
        org.id,
        project.id,
        feature.reference,
      );
      expect(features.length).toEqual(1);
      expect(features[0].id).toEqual(feature.id);
      expect(features[0].title).toEqual('my feature');
      expect(features[0].priority).toEqual(Priority.LOW);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });

  describe('when listing feature comments', () => {
    it('should return a list of comments if the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'Test title',
        description: 'A test description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      await service.createFeatureComment(user.id, feature.id, {
        content: 'Test comment',
        mentions: [],
      });
      const comments = await service.listFeatureComments(feature.id);
      expect(comments).toBeDefined();
      expect(comments.length).toEqual(1);
      expect(comments[0].content).toEqual('Test comment');
    });
  });

  describe('when creating a feature comment', () => {
    it('should create a comment if the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'Test title',
        description: 'A test description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const comment = await service.createFeatureComment(user.id, feature.id, {
        content: 'Test comment',
        mentions: [user.id],
      });
      expect(comment).toBeDefined();
      expect(comment.content).toEqual('Test comment');
    });
  });

  describe('when deleting a feature comment', () => {
    it('should delete the comment if it exists', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'Test title',
        description: 'A test description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const comment = await service.createFeatureComment(user.id, feature.id, {
        content: 'Test comment',
        mentions: [],
      });
      await service.deleteFeatureComment(user.id, feature.id, comment.id);
      await expect(service.listFeatureComments(feature.id)).resolves.toEqual(
        [],
      );
    });

    it('should throw an error if the comment does not exist', async () => {
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'Test title',
        description: 'A test description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      await expect(
        service.deleteFeatureComment(
          user.id,
          feature.id,
          'non-existent-comment-id',
        ),
      ).rejects.toThrowError();
    });
  });

  describe('when updating a feature comment', () => {
    it('should update the comment if it exists and the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'Test title',
        description: 'A test description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const comment = await service.createFeatureComment(user.id, feature.id, {
        content: 'Test comment',
        mentions: [],
      });
      const updatedComment = await service.updateFeatureComment(
        user.id,
        feature.id,
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'Test title',
        description: 'A test description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      await expect(
        service.updateFeatureComment(
          user.id,
          feature.id,
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
      const feature = await service.createFeature(org.id, project.id, user.id, {
        title: 'Test title',
        description: 'A test description',
        priority: Priority.HIGH,
        status: FeatureStatus.PLANNED,
      });
      const comment = await service.createFeatureComment(user.id, feature.id, {
        content: 'Test comment',
        mentions: [],
      });
      await expect(
        service.updateFeatureComment(user.id, feature.id, comment.id, {
          content: '',
          mentions: [],
        }),
      ).rejects.toThrowError('Comment content is required');
    });
  });
});
