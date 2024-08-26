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
  let featureRequestsRepository: Repository<FeatureRequest>;
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
    featureRequestsRepository = module.get<Repository<FeatureRequest>>(
      getRepositoryToken(FeatureRequest),
    );
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
      expect(featureRequest.status).toEqual(FeatureRequestStatus.PLANNED);
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
});
