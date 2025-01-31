import { WorkItemsService } from './work-items.service';
import { UsersService } from '../../users/users.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { User } from '../../users/user.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { Sprint } from '../../sprints/sprint.entity';
import { WorkItem } from './work-item.entity';
import { SprintsService } from '../../sprints/sprints.service';
import { File } from '../../files/file.entity';
import { WorkItemFile } from './work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { WorkItemsEventHandler } from './work-items.event-handler';
import { WorkItemsStatusStats } from './work-items-status-stats.entity';
import { WorkItemsStatusLog } from './work-items-status-log.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';

describe('WorkItemsEventHandler', () => {
  let cleanup: () => Promise<void>;
  let handler: WorkItemsEventHandler;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Feature,
          User,
          Milestone,
          Sprint,
          WorkItem,
          File,
          FeatureFile,
          WorkItemFile,
          WorkItemsStatusStats,
          WorkItemsStatusLog,
        ]),
      ],
      [
        OkrsService,
        OrgsService,
        FeaturesService,
        UsersService,
        MilestonesService,
        WorkItemsService,
        SprintsService,
        WorkItemsEventHandler,
        FilesService,
        FilesStorageRepository,
      ],
    );
    handler = module.get<WorkItemsEventHandler>(WorkItemsEventHandler);
    cleanup = dbCleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', async () => {
    expect(handler).toBeDefined();
  });
});
