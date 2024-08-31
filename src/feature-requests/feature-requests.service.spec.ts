import { FeatureRequestsService } from './feature-requests.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlan } from '../auth/payment.plan';
import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { uuid } from 'uuidv4';

describe('FeatureRequestsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: FeatureRequestsService;
  let orgsRepository: Repository<Org>;
  let org: Org;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
          FeatureRequestsService,
          FeatureRequest,
        ]),
      ],
      [FeatureRequestsService, UsersService, OrgsService],
    );
    cleanup = dbCleanup;
    service = module.get<FeatureRequestsService>(FeatureRequestsService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    org.paymentPlan = PaymentPlan.PREMIUM;
    await orgsRepository.save(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when adding a new feature request', () => {
    it('should create a new feature request', async () => {
      const featureRequest = await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      expect(featureRequest).toBeDefined();
      expect(featureRequest.id).toBeDefined();
      expect(featureRequest.title).toEqual('Test Feature Request');
      expect(featureRequest.description).toEqual('Test Description');
      expect(featureRequest.status).toEqual(FeatureRequestStatus.PENDING);
      expect(featureRequest.estimation).toBeNull();
      expect(featureRequest.completedAt).toBeNull();
      expect(featureRequest.org).toBeDefined();
      expect(featureRequest.createdBy).toBeDefined();
    });

    it('should create a new feature request only if the org is premium', () => {
      const freeOrg = orgsRepository.create({
        name: 'Free Org',
        paymentPlan: PaymentPlan.FREE,
      });

      expect(
        service.addFeatureRequest(user.id, freeOrg.id, {
          title: 'Test Feature Request',
          description: 'Test Description',
        }),
      ).rejects.toThrow();
    });
  });

  describe('when listing feature requests', () => {
    it('should return all feature requests for the org', async () => {
      await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request 1',
        description: 'Test Description 1',
      });
      await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request 2',
        description: 'Test Description 2',
      });

      const featureRequests = await service.listFeatureRequests(org.id);
      expect(featureRequests).toHaveLength(2);
      expect(featureRequests[0].title).toEqual('Test Feature Request 2');
      expect(featureRequests[1].title).toEqual('Test Feature Request 1');
    });
    it('should return an empty array if there are no feature requests', async () => {
      const featureRequests = await service.listFeatureRequests(org.id);
      expect(featureRequests).toHaveLength(0);
    });
    it('should return an empty array if the org does not exist', async () => {
      const featureRequests = await service.listFeatureRequests(uuid());
      expect(featureRequests).toHaveLength(0);
    });
    it('should return the feature requests in pages', async () => {
      await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request 1',
        description: 'Test Description 1',
      });
      await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request 2',
        description: 'Test Description 2',
      });

      const featureRequests = await service.listFeatureRequests(org.id, 1, 1);
      expect(featureRequests).toHaveLength(1);
      expect(featureRequests[0].title).toEqual('Test Feature Request 2');
    });
  });

  describe('when getting a feature request by id', () => {
    it('should return the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const foundFeatureRequest = await service.getFeatureRequestById(
        org.id,
        featureRequest.id,
      );
      expect(foundFeatureRequest).toBeDefined();
      expect(foundFeatureRequest.id).toEqual(featureRequest.id);
      expect(foundFeatureRequest.title).toEqual('Test Feature Request');
      expect(foundFeatureRequest.description).toEqual('Test Description');
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.getFeatureRequestById(org.id, uuid()),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const featureRequest = await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.getFeatureRequestById(otherOrg.id, featureRequest.id),
      ).rejects.toThrow();
    });
  });

  describe('when updating a feature request', () => {
    it('should update the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const updatedFeatureRequest = await service.updateFeatureRequest(
        user.id,
        org.id,
        featureRequest.id,
        {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: FeatureRequestStatus.IN_PROGRESS,
          estimation: 5,
        },
      );

      expect(updatedFeatureRequest).toBeDefined();
      expect(updatedFeatureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeatureRequest.title).toEqual('Updated Feature Request');
      expect(updatedFeatureRequest.description).toEqual('Updated Description');
      expect(updatedFeatureRequest.status).toEqual(
        FeatureRequestStatus.IN_PROGRESS,
      );
      expect(updatedFeatureRequest.estimation).toEqual(5);
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.updateFeatureRequest(user.id, org.id, uuid(), {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: FeatureRequestStatus.IN_PROGRESS,
          estimation: 5,
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const featureRequest = await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.updateFeatureRequest(user.id, otherOrg.id, featureRequest.id, {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: FeatureRequestStatus.IN_PROGRESS,
          estimation: 5,
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the user does not belong to the org', async () => {
      const featureRequest = await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otheruser@exmaple.com',
        'testtesttest',
      );

      await expect(
        service.updateFeatureRequest(otherUser.id, org.id, featureRequest.id, {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: FeatureRequestStatus.IN_PROGRESS,
          estimation: 5,
        }),
      ).rejects.toThrow();
    });
  });
  describe('when deleting a feature request', () => {
    it('should delete the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(user.id, org.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      await service.deleteFeatureRequest(user.id, org.id, featureRequest.id);

      await expect(
        service.getFeatureRequestById(org.id, featureRequest.id),
      ).rejects.toThrow();
    });
  });
  it('should throw an error if the feature request does not exist', async () => {
    await expect(
      service.deleteFeatureRequest(user.id, org.id, uuid()),
    ).rejects.toThrow();
  });
  it('should throw an error if the feature request does not belong to the org', async () => {
    const featureRequest = await service.addFeatureRequest(user.id, org.id, {
      title: 'Test Feature Request',
      description: 'Test Description',
    });

    const otherOrg = await orgsService.createForUser(user);
    await orgsRepository.save(otherOrg);

    await expect(
      service.deleteFeatureRequest(user.id, otherOrg.id, featureRequest.id),
    ).rejects.toThrow();
  });
});
