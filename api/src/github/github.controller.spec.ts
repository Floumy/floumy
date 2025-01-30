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
import { GithubBranch } from './github-branch.entity';
import { GithubPullRequest } from './github-pull-request.entity';

describe('GithubController', () => {
  let controller: GithubController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
          Project,
          GithubBranch,
          GithubPullRequest,
        ]),
        UsersModule,
      ],
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
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
