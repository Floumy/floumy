import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { OrgsModule } from '../orgs/orgs.module';
import { RefreshToken } from '../auth/refresh-token.entity';
import { UserRole } from './enums';

describe('UsersService', () => {
  let service: UsersService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [OrgsModule, TypeOrmModule.forFeature([User, RefreshToken])],
      [UsersService],
    );
    cleanup = dbCleanup;
    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when finding a user by email', () => {
    it('should return the user object', async () => {
      const user = await service.findOneByEmail('john');
      expect(user).toBeDefined();
    });
  });

  describe('when creating a user', () => {
    it('should return the user object', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      expect(user).toBeDefined();
    });
    it('should store the user object', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      const storedUser = await service.findOneByEmail('test@example.com');
      expect(storedUser.id).toBeDefined();
      expect(storedUser.name).toEqual(user.name);
      expect(storedUser.email).toEqual(user.email);
      expect(storedUser.password).toBeDefined();
    });
    it('should validate the user password', async () => {
      await expect(
        service.createUserWithOrg('Test User', 'test', ''),
      ).rejects.toThrow();
    });
    it('should validate the email', async () => {
      await expect(
        service.createUserWithOrg('Test User', '', 'test'),
      ).rejects.toThrow();
    });
    it('should validate that the email is unique', async () => {
      await service.createUserWithOrg(
        'steve',
        'steve@example.com',
        'testtesttest',
      );
      await expect(
        service.createUserWithOrg('steve', 'steve@example.com', 'test'),
      ).rejects.toThrow();
    });
    it('should validate the email', async () => {
      await expect(
        service.createUserWithOrg('steve', 'steveemail', 'test'),
      ).rejects.toThrow();
    });
    it('should validate that the password is not too short', async () => {
      await expect(
        service.createUserWithOrg('steve', 'steve@example.com', 'test'),
      ).rejects.toThrow();
    });
    it('should validate that the name is not too short', async () => {
      await expect(
        service.createUserWithOrg('S', 'test@example.com', 'testtesttest'),
      ).rejects.toThrow();
    });
    it('should store the password as a hash', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      expect(user.password).not.toEqual('test');
    });
    it('should create an organization for the user', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      const org = await user.org;
      expect(org).toBeDefined();
      expect(org.id).toBeDefined();
    });
    it('should associate the user with the organization based on invitation token', async () => {
      const user1 = await service.createUserWithOrg(
        'Test Org',
        'test@example.com',
        'testtesttest',
      );
      const org1 = await user1.org;
      const user2 = await service.createUserWithOrg(
        'Test User',
        'testing@example.com',
        'testtesttest',
        org1.invitationToken,
      );
      const org2 = await user2.org;
      expect(org1.id).toEqual(org2.id);
    });
  });
  describe('when getting a user by id', () => {
    it('should return the user object', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      const foundUser = await service.findOne(user.id);
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toEqual(user.id);
      expect(foundUser.name).toEqual(user.name);
      expect(foundUser.email).toEqual(user.email);
    });
  });
  describe('when deactivating a user', () => {
    it('should deactivate the user', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      user.isActive = true;
      await service.save(user);
      const org = await user.org;
      const newUser = await service.createUserWithOrg(
        'Test User',
        'test2@example.com',
        'testtesttest',
        org.invitationToken,
      );
      newUser.isActive = true;
      await service.save(newUser);
      await service.deactivate(org.id, newUser.id);
      const foundUser = await service.findOne(newUser.id);
      expect(foundUser.isActive).toBe(false);
    });
  });
  describe("when patching a user's name", () => {
    it('should update the user name', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      const newName = 'New Name';
      await service.patch(user.id, { name: newName });
      const foundUser = await service.findOne(user.id);
      expect(foundUser.name).toEqual(newName);
    });
  });
  describe("when updating the user's role", () => {
    it('should update the user role', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test1@example.com',
        'testtesttest',
      );
      const org = await user.org;
      const secondUser = await service.createUser(
        'Second User',
        'test2@example.com',
        'testtesttest',
        org,
      );
      const newRole = 'admin';
      await service.changeRole(user.id, org.id, secondUser.id, newRole);
      const foundUser = await service.findOne(user.id);
      expect(foundUser.role).toEqual(UserRole.ADMIN);
    });
    it('should throw an error if the user tries to change their own role', async () => {
      const user = await service.createUserWithOrg(
        'Test User',
        'test@example.com',
        'testtesttest',
      );
      const org = await user.org;
      await expect(
        service.changeRole(user.id, org.id, user.id, 'admin'),
      ).rejects.toThrow();
    });
  });
});
