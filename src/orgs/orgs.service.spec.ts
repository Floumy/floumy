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
        org.invitationTo,
      );
      expect(org.id).toEqual(actual.id);
      expect(actual.name).toEqual(org.name);
    });
    it('should return the newly created org with the provided name', async () => {
      const actual = await service.getByInvitationTokenOrCreateWithNameAndPlan(
        '',
        'Test org',
        PaymentPlan.BUILD_IN_PRIVATE,
      );
      expect(actual.id).toBeDefined();
      expect(actual.id).not.toBeNull();
      expect(actual.name).toEqual('Test org');
    });
  });
});
