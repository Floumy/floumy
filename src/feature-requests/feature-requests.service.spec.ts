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

describe('FeatureRequestsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: FeatureRequestsService;
  let orgsRepository: Repository<Org>;
  let usersRepository: Repository<User>;
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
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
      expect(await featureRequest.org).toBeDefined();
      expect(await featureRequest.createdBy).toBeDefined();
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
});
