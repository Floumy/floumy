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
import { GithubPullRequest } from './github-pull-request.entity';
import { GithubBranch } from './github-branch.entity';
import { GithubPullRequestMapper } from './mappers';

describe('GithubService', () => {
  let usersService: UsersService;
  let service: GithubService;
  let orgsService: OrgsService;
  let user: User;
  let org: Org;
  let project: Project;
  let orgsRepository: Repository<Org>;
  let encryptionService: EncryptionService;
  let githubBranchRepository: Repository<GithubBranch>;
  let githubPullRequestRepository: Repository<GithubPullRequest>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Project, User, GithubBranch, GithubPullRequest]), EncryptionModule],
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
});
