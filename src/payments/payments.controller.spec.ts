import { PaymentsController } from './payments.controller';
import { Org } from '../orgs/org.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { PaymentsService } from './payments.service';
import { StripeService } from '../stripe/stripe.service';
import { OrgsModule } from '../orgs/orgs.module';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User]), UsersModule, OrgsModule],
      [PaymentsService, StripeService],
      [PaymentsController],
    );
    cleanup = dbCleanup;
    controller = module.get<PaymentsController>(PaymentsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
