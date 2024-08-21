import { FeatureRequestsController } from './feature-requests.controller';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { FeatureRequestsService } from './feature-requests.service';
import { PaymentPlan } from '../auth/payment.plan';
import { FeatureRequest } from './feature-request.entity';

describe('FeatureRequestsController', () => {
  let controller: FeatureRequestsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let orgsRepository: Repository<Org>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, FeatureRequest]), UsersModule],
      [FeatureRequestsService],
      [FeatureRequestsController],
    );
    cleanup = dbCleanup;
    controller = module.get<FeatureRequestsController>(
      FeatureRequestsController,
    );
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    org.paymentPlan = PaymentPlan.PREMIUM;
    await orgsRepository.save(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when adding a new feature request', () => {
    it('should return the newly created feature request', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const result = await controller.addFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        createFeatureRequestDto,
      );
      expect(result.title).toBe(createFeatureRequestDto.title);
      expect(result.description).toBe(createFeatureRequestDto.description);
    });
  });
});
