import { OrgsController } from './orgs.controller';
import { Org } from './org.entity';
import { WorkItemsService } from '../backlog/work-items/work-items.service';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../okrs/objective.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { Iteration } from '../iterations/Iteration.entity';
import { File } from '../files/file.entity';
import { WorkItemFile } from '../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../roadmap/features/feature-file.entity';
import { UsersModule } from '../users/users.module';
import { OkrsService } from '../okrs/okrs.service';
import { OrgsService } from './orgs.service';
import { TokensService } from '../auth/tokens.service';
import { FeaturesService } from '../roadmap/features/features.service';
import { MilestonesService } from '../roadmap/milestones/milestones.service';
import { IterationsService } from '../iterations/iterations.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { FilesService } from '../files/files.service';
import { FilesStorageRepository } from '../files/files-storage.repository';

describe('OrgsController', () => {
  let controller: OrgsController;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
          Objective,
          KeyResult,
          Feature,
          WorkItem,
          Milestone,
          Iteration,
          File,
          WorkItemFile,
          FeatureFile,
        ]),
        UsersModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        FeaturesService,
        MilestonesService,
        WorkItemsService,
        IterationsService,
        FilesService,
        FilesStorageRepository,
      ],
      [OrgsController],
    );
    cleanup = dbCleanup;
    controller = module.get<OrgsController>(OrgsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
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

  describe('when getting the org', () => {
    it('should return the org', async () => {
      const result = await controller.getOrg({ user: { org: org.id } });
      expect(result.id).toBe(org.id);
      expect(result.invitationToken).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.members).toHaveLength(1);
    });
  });

  describe('when patching the org', () => {
    it('should return the org', async () => {
      const result = await controller.patchOrg(
        { user: { org: org.id } },
        { name: 'New Name' },
      );
      expect(result.id).toBe(org.id);
      expect(result.name).toBe('New Name');
    });
  });
});
