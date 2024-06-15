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
  let paymentsService: PaymentsService;

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
    paymentsService = module.get<PaymentsService>(PaymentsService);

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

  describe('webhook', () => {
    it('should return received: true', async () => {
      const request = {
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: {},
        rawBody: 'test-raw-body',
      };

      jest.spyOn(paymentsService, 'constructEvent').mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            subscription: {
              current_period_end: 1234567890,
            },
            metadata: {
              org: org.id,
              plan: 'build-in-private',
            },
          },
        },
      } as any);

      const result = await controller.webhook(request as any);
      expect(result).toEqual({ received: true });
    });
  });

  describe('createCheckoutSession', () => {
    it('should return a URL', async () => {
      const request = {
        user: {
          org,
        },
        body: {
          paymentPlan: 'build-in-public',
        },
      };

      jest
        .spyOn(paymentsService, 'createCheckoutSessionUrl')
        .mockResolvedValue('https://checkout.stripe.com/checkout/session');

      const result = await controller.createCheckoutSession(request);
      expect(result).toEqual({
        url: 'https://checkout.stripe.com/checkout/session',
      });
    });
  });

  describe('hasActiveSubscription', () => {
    it('should return the subscription status', async () => {
      const request = {
        user: {
          org,
        },
      };

      jest.spyOn(paymentsService, 'getSubscriptionStatus').mockResolvedValue({
        nextPaymentDate: new Date(),
        hasActiveSubscriptions: true,
      });

      const result = await controller.hasActiveSubscription(request);
      expect(result).toEqual({
        nextPaymentDate: expect.any(Date),
        hasActiveSubscriptions: true,
      });
    });
  });
});
