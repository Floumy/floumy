import { GithubService } from './github.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Project } from '../projects/project.entity';
import { uuid } from 'uuidv4';
import { Repository } from 'typeorm';
import { EncryptionModule } from '../encryption/encryption.module';

describe('GithubService', () => {
  let usersService: UsersService;
  let service: GithubService;
  let orgsService: OrgsService;
  let user: User;
  let org: Org;
  let project: Project;
  let orgsRepository: Repository<Org>;
  let encryptionService: EncryptionService;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Project, User]), EncryptionModule],
      [GithubService, EncryptionService, UsersService],
    );
    cleanup = dbCleanup;
    service = module.get<GithubService>(GithubService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    encryptionService = module.get<EncryptionService>(EncryptionService);

    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);

    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when getting the auth url', () => {
    it('should return the auth url', async () => {
      const authUrl = await service.getAuthUrl(org.id, project.id);
      expect(authUrl).toBeDefined();
    });
  });

  describe('when getting the repos', () => {
    it('should return the repos', async () => {
      org.githubAccessToken = encryptionService.encrypt(uuid());
      await orgsRepository.save(org);
      // Spy on getAuthenticatedOctokit to return a mock response
      jest.spyOn(service, 'getAuthenticatedOctokit').mockImplementation(() => {
        return {
          rest: {
            repos: {
              listForAuthenticatedUser: jest.fn().mockResolvedValue({
                data: [{ id: uuid() }, { id: uuid() }],
              }),
            },
          },
        } as any;
      });
      const repos = await service.getRepos(org.id);
      expect(repos).toBeDefined();
      expect(repos.length).toBeGreaterThan(0);
    });
  });

  describe('when checking if the user is connected', () => {
    it('should return true if the user is connected', async () => {
      org.githubAccessToken = encryptionService.encrypt(uuid());
      await orgsRepository.save(org);
      // Spy on getAuthenticatedOctokit to return a mock response
      jest.spyOn(service, 'getAuthenticatedOctokit').mockImplementation(() => {
        return {
          rest: {
            users: {
              getAuthenticated: jest.fn().mockResolvedValue({}),
            },
          },
        } as any;
      });
      const isConnected = await service.isConnected(org.id);
      expect(isConnected).toBeDefined();
      expect(isConnected.connected).toBe(true);
    });
    it('should return false if the user is not connected', async () => {
      const isConnected = await service.isConnected(org.id);
      expect(isConnected).toBeDefined();
      expect(isConnected.connected).toBe(false);
    });
  });
});
