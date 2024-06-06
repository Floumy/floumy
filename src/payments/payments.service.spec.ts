import { PaymentsService } from './payments.service';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { StripeModule } from '../stripe/stripe.module';

describe('PaymentsService', () => {
  let service: PaymentsService;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User]), OrgsModule, StripeModule],
      [PaymentsService],
    );
    service = module.get<PaymentsService>(PaymentsService);

    cleanup = dbCleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
