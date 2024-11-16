import { OrgsService } from './orgs.service';
import { Org } from './org.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { setupTestingModule } from '../../test/test.utils';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';

describe('OrgsService', () => {
  let service: OrgsService;
  let usersService: UsersService;
  let orgsRepository: Repository<Org>;
  let productsRepository: Repository<Product>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User])],
      [OrgsService, UsersService],
    );
    service = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    productsRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
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
    it('should return the org based on the invitationToken', async () => {
      const org = new Org();
      org.name = 'Some org';
      await orgsRepository.save(org);
      const actual = await service.getOrCreateOrg(org.invitationToken);
      expect(org.id).toEqual(actual.id);
      expect(actual.name).toEqual(org.name);
    });
    it('should return the newly created org with the provided name', async () => {
      const actual = await service.getOrCreateOrg('');
      expect(actual.id).toBeDefined();
      expect(actual.id).not.toBeNull();
    });
  });

  describe('when patching the org', () => {
    it('should return the org', async () => {
      const org = new Org();
      org.name = 'Old Name';
      await orgsRepository.save(org);
      const product = new Product();
      product.name = 'Old Name';
      await productsRepository.save(product);
      await service.patchOrg(org.id, 'New Name');
      const storedOrg = await service.findOneById(org.id);
      expect(storedOrg.name).toBe('New Name');
    });
  });
});
