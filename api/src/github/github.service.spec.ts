import { GithubService } from './github.service';
import { UsersService } from '../users/users.service';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionService } from '../encryption/encryption.service';
import { Project } from '../projects/project.entity';
import { EncryptionModule } from '../encryption/encryption.module';
import { GithubPullRequest } from './github-pull-request.entity';
import { GithubBranch } from './github-branch.entity';

describe('GithubService', () => {
  let service: GithubService;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          Project,
          User,
          GithubBranch,
          GithubPullRequest,
        ]),
        EncryptionModule,
      ],
      [GithubService, EncryptionService, UsersService],
    );
    cleanup = dbCleanup;
    service = module.get<GithubService>(GithubService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
