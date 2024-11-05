import { FeaturesController } from './features.controller';
import { OrgsService } from '../../orgs/orgs.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { OkrsService } from '../../okrs/okrs.service';
import { TokensService } from '../../auth/tokens.service';
import { Feature } from './feature.entity';
import { Objective } from '../../okrs/objective.entity';
import { Priority } from '../../common/priority.enum';
import { FeaturesService } from './features.service';
import { UsersService } from '../../users/users.service';
import { UsersModule } from '../../users/users.module';
import { MilestonesService } from '../milestones/milestones.service';
import { Milestone } from '../milestones/milestone.entity';
import { BacklogModule } from '../../backlog/backlog.module';
import { FeatureStatus } from './featurestatus.enum';
import { Iteration } from '../../iterations/Iteration.entity';
import { File } from '../../files/file.entity';
import { FeatureFile } from './feature-file.entity';
import { User } from '../../users/user.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FeatureComment } from './feature-comment.entity';
import { Repository } from 'typeorm';
import { PaymentPlan } from '../../auth/payment.plan';
import { FeatureRequest } from '../../feature-requests/feature-request.entity';
import { FeatureRequestComment } from '../../feature-requests/feature-request-comment.entity';
import { FeatureRequestVote } from '../../feature-requests/feature-request-vote.entity';
import { Product } from '../../products/product.entity';

describe('FeaturesController', () => {
  let controller: FeaturesController;
  let milestoneService: MilestonesService;
  let orgsRepository: Repository<Org>;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let product: Product;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          Objective,
          KeyResult,
          Feature,
          Milestone,
          Iteration,
          File,
          FeatureFile,
          WorkItem,
          WorkItemFile,
          FeatureComment,
          FeatureRequest,
          FeatureRequestComment,
          FeatureRequestVote,
          Product,
        ]),
        UsersModule,
        BacklogModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        FeaturesService,
        MilestonesService,
        FilesService,
        FilesStorageRepository,
      ],
      [FeaturesController],
    );
    cleanup = dbCleanup;
    controller = module.get<FeaturesController>(FeaturesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    milestoneService = module.get<MilestonesService>(MilestonesService);
    orgsRepository = module.get(getRepositoryToken(Org));

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
    expect(controller).toBeDefined();
  });

  describe('when creating a feature', () => {
    it('should return 201', async () => {
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.CLOSED,
        },
      );
      expect(featureResponse.title).toEqual('my feature');
      expect(featureResponse.description).toEqual('my feature description');
      expect(featureResponse.priority).toEqual(Priority.HIGH);
      expect(featureResponse.status).toEqual(FeatureStatus.CLOSED);
      expect(featureResponse.createdAt).toBeDefined();
    });
    it('should return 400 if title is missing', async () => {
      try {
        await controller.create(
          org.id,
          product.id,
          {
            user: {
              sub: user.id,
              org: org.id,
            },
          },
          {
            title: null,
            description: 'my feature description',
            priority: Priority.HIGH,
            status: FeatureStatus.PLANNED,
          },
        );
      } catch (e) {
        expect(e.message).toEqual('Bad Request');
      }
    });
  });
  describe('when getting features', () => {
    it('should return 200', async () => {
      await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const features = await controller.list(org.id, product.id, {
        user: {
          org: org.id,
        },
      });
      expect(features[0].title).toEqual('my feature');
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].progress).toEqual(0);
      expect(features[0].workItemsCount).toEqual(0);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
    it('should return features paginated', async () => {
      await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature 2',
          description: 'my feature description 2',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const features = await controller.list(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        1,
        1,
      );
      expect(features.length).toEqual(1);
    });
  });
  describe('when getting features without milestone', () => {
    it('should return 200', async () => {
      await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const features = await controller.listWithoutMilestone(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
      );
      expect(features[0].title).toEqual('my feature');
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });
  describe('when getting a feature', () => {
    it('should return 200', async () => {
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature = await controller.get(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        featureResponse.id,
      );
      expect(feature.title).toEqual('my feature');
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
  });
  describe('when updating a feature', () => {
    it('should return 200', async () => {
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature = await controller.update(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        featureResponse.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.CLOSED,
        },
      );
      expect(feature.title).toEqual('my feature');
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.status).toEqual(FeatureStatus.CLOSED);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
  });
  describe('when deleting a feature', () => {
    it('should return 200', async () => {
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      await controller.delete(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        featureResponse.id,
      );
    });
  });
  describe('when patching the feature', () => {
    it('should update the status', async () => {
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature = await controller.patch(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        featureResponse.id,
        {
          status: FeatureStatus.CLOSED,
        },
      );
      expect(feature.title).toEqual('my feature');
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.status).toEqual(FeatureStatus.CLOSED);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
    it('should update the priority', async () => {
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature = await controller.patch(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        featureResponse.id,
        {
          priority: Priority.LOW,
        },
      );
      expect(feature.title).toEqual('my feature');
      expect(feature.priority).toEqual(Priority.LOW);
      expect(feature.status).toEqual(FeatureStatus.PLANNED);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
    it('should update the milestone', async () => {
      const milestone = await milestoneService.createMilestone(
        org.id,
        product.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature = await controller.patch(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        featureResponse.id,
        {
          milestone: milestone.id,
        },
      );
      expect(feature.title).toEqual('my feature');
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.status).toEqual(FeatureStatus.PLANNED);
      expect(feature.milestone.id).toEqual(milestone.id);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
  });
  describe('when searching features', () => {
    it('should return 200', async () => {
      await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const features = await controller.search(
        org.id,
        product.id,
        {
          user: {
            org: org.id,
          },
        },
        'my feature',
      );
      expect(features[0].title).toEqual('my feature');
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });
  describe('when listing feature comments', () => {
    it('should return the list of comments', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        featureResponse.id,
        {
          content: 'my comment',
        },
      );
      const comments = await controller.listComments(featureResponse.id);
      expect(comments[0].content).toEqual('my comment');
      expect(comments[0].createdAt).toBeDefined();
    });
  });
  describe('when adding a comment to a feature', () => {
    it('should return the newly added comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const comment = await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        featureResponse.id,
        {
          content: 'my comment',
        },
      );
      expect(comment.content).toEqual('my comment');
      expect(comment.createdAt).toBeDefined();
    });
  });
  describe('when deleting a comment from a feature', () => {
    it('should delete it successfully', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const comment = await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        featureResponse.id,
        {
          content: 'my comment',
        },
      );
      await controller.deleteComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        featureResponse.id,
        comment.id,
      );
    });
  });
  describe('when updating a comment from a feature', () => {
    it('should return the updated comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const featureResponse = await controller.create(
        org.id,
        product.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const comment = await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        featureResponse.id,
        {
          content: 'my comment',
        },
      );
      const updatedComment = await controller.updateComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        featureResponse.id,
        comment.id,
        {
          content: 'my updated comment',
        },
      );
      expect(updatedComment.content).toEqual('my updated comment');
      expect(updatedComment.createdAt).toBeDefined();
    });
  });
});
