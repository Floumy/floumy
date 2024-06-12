import { OrgsService } from './orgs.service';
import { Org } from './org.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { setupTestingModule } from '../../test/test.utils';
import { Repository } from 'typeorm';
import { PaymentPlan } from '../auth/payment.plan';

describe('OrgsService', () => {
  let service: OrgsService;
  let usersService: UsersService;
  let orgsRepository: Repository<Org>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User])],
      [OrgsService, UsersService],
    );
    service = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    cleanup = dbCleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an org', async () => {
    const user = new User('Test User', 'test@example.com', 'testtesttest');
    const org = await service.createForUser(user);
    expect(org).toBeInstanceOf(Org);
    expect(org.id).toBeDefined();
    expect(await org.users).toHaveLength(1);
  });

  it('should fetch an org by id', async () => {
    const user = new User('Test User', 'test@example.com', 'testtesttest');
    const org = await service.createForUser(user);
    const fetchedOrg = await service.findOneById(org.id);
    expect(fetchedOrg).not.toBeNull();
    expect(fetchedOrg.id).toEqual(org.id);
  });

  describe('when getting the org', () => {
    it('should return the org of the user', async () => {
      const savedUser = await usersService.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      const org = await service.getOrg((await savedUser.org).id);
      expect(org.id).toBeDefined();
      expect(org.invitationToken).toBeDefined();
    });
  });

  describe('when getting or creating the org', () => {
    it('should validate that either the name or invitationToken are set', () => {
      expect(
        service.getByInvitationTokenOrCreateWithNameAndPlan(),
      ).rejects.toThrow();
    });
    it('should return the org based on the invitationToken', async () => {
      const org = new Org();
      org.name = 'Some org';
      await orgsRepository.save(org);
      const actual = await service.getByInvitationTokenOrCreateWithNameAndPlan(
        org.invitationToken,
      );
      expect(org.id).toEqual(actual.id);
      expect(actual.name).toEqual(org.name);
    });
    it('should return the newly created org with the provided name', async () => {
      const actual = await service.getByInvitationTokenOrCreateWithNameAndPlan(
        '',
        'Test org',
      );
      expect(actual.id).toBeDefined();
      expect(actual.id).not.toBeNull();
      expect(actual.name).toEqual('Test org');
    });
    it('should create an org with the default payment plan', async () => {
      const actual = await service.getByInvitationTokenOrCreateWithNameAndPlan(
        '',
        'Test org',
      );
      expect(actual.paymentPlan).toBeDefined();
      expect(actual.paymentPlan).toEqual(PaymentPlan.TRIAL);
      expect(actual.isSubscribed).toEqual(false);
      expect(actual.nextPaymentDate).toBeNull();
    });
  });

  describe('when verifying the active subscription', () => {
    it('should return false when the org is on trial and was created more than 7 days ago', async () => {
      const org = new Org();
      org.paymentPlan = PaymentPlan.TRIAL;
      org.createdAt = new Date();
      org.createdAt.setDate(org.createdAt.getDate() - 8);
      await orgsRepository.save(org);
      const result = await service.hasActiveSubscription(org.id);
      expect(result).toBe(false);
    });
    it('should return true when the org is on trial and was created less than 7 days ago', async () => {
      const org = new Org();
      org.paymentPlan = PaymentPlan.TRIAL;
      org.createdAt = new Date();
      org.createdAt.setDate(org.createdAt.getDate() - 6);
      await orgsRepository.save(org);
      const result = await service.hasActiveSubscription(org.id);
      expect(result).toBe(true);
    });
    it('should return false when the org is not subscribed', async () => {
      const org = new Org();
      org.paymentPlan = PaymentPlan.TRIAL;
      org.createdAt = new Date();
      org.createdAt.setDate(org.createdAt.getDate() - 7);
      org.isSubscribed = false;
      await orgsRepository.save(org);
      const result = await service.hasActiveSubscription(org.id);
      expect(result).toBe(false);
    });
    it('should return false when the org is subscribed but the next payment date is in the past', async () => {
      const org = new Org();
      org.paymentPlan = PaymentPlan.TRIAL;
      org.createdAt = new Date();
      org.createdAt.setDate(org.createdAt.getDate() - 7);
      org.isSubscribed = true;
      org.nextPaymentDate = new Date();
      org.nextPaymentDate.setDate(org.nextPaymentDate.getDate() - 1);
      await orgsRepository.save(org);
      const result = await service.hasActiveSubscription(org.id);
      expect(result).toBe(false);
    });
    it('should return true when the org is subscribed and the next payment date is in the future', async () => {
      const org = new Org();
      org.paymentPlan = PaymentPlan.TRIAL;
      org.createdAt = new Date();
      org.createdAt.setDate(org.createdAt.getDate() - 7);
      org.isSubscribed = true;
      org.nextPaymentDate = new Date();
      org.nextPaymentDate.setDate(org.nextPaymentDate.getDate() + 1);
      await orgsRepository.save(org);
      const result = await service.hasActiveSubscription(org.id);
      expect(result).toBe(true);
    });
  });
});
