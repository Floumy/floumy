import { GithubController } from './github.controller';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { GithubService } from './github.service';
import { EncryptionService } from '../encryption/encryption.service';
import { uuid } from 'uuidv4';
import { Repository } from 'typeorm';

describe('GithubController', () => {
  let controller: GithubController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Project]), UsersModule],
      [GithubService, EncryptionService],
      [GithubController],
    );
    cleanup = dbCleanup;
    controller = module.get<GithubController>(GithubController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    const encryptionService = module.get<EncryptionService>(EncryptionService);
    const githubService = module.get<GithubService>(GithubService);

    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    org.githubAccessToken = encryptionService.encrypt(uuid());
    await orgsRepository.save(org);
    // Spy on getAuthenticatedOctokit to return a mock response
    jest
      .spyOn(githubService, 'getAuthenticatedOctokit')
      .mockImplementation(() => {
        return {
          rest: {
            users: {
              getAuthenticated: jest.fn().mockResolvedValue({}),
            },
            repos: {
              listForAuthenticatedUser: jest.fn().mockResolvedValue({
                data: [{ id: uuid() }, { id: uuid() }],
              }),
            },
          },
        } as any;
      });
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when getting the auth url', () => {
    it('should return the auth url', async () => {
      const authUrl = await controller.getAuthUrl(
        {
          user: {
            org: org.id,
          },
        },
        org.id,
        project.id,
      );
      expect(authUrl).toBeDefined();
    });
  });

  describe('when handling the OAuth callback', () => {
    it('should return the redirect url', async () => {
      const redirectUrl = await controller.handleOAuthCallback(
        'code',
        'state',
        {
          redirect: jest.fn().mockReturnValue({
            redirect: jest.fn().mockReturnValue({}),
          }),
        },
      );
      expect(redirectUrl).toBeDefined();
    });
  });

  describe('when getting the repos', () => {
    it('should return the repos', async () => {
      const repos = await controller.getRepos(
        {
          user: {
            org: org.id,
          },
        },
        org.id,
      );
      expect(repos).toBeDefined();
      expect(repos.length).toBeGreaterThan(0);
    });
  });

  describe('when checking if the user is connected', () => {
    it('should return true if the user is connected', async () => {
      const isConnected = await controller.isConnected(
        {
          user: {
            org: org.id,
          },
        },
        org.id,
      );
      expect(isConnected).toBeDefined();
      expect(isConnected.connected).toBe(true);
    });
  });
});
