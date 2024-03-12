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
import { Iteration } from '../../iterations/Iteration.entity';
import { WorkItem } from './work-item.entity';
import { IterationsService } from '../../iterations/iterations.service';
import { File } from '../../files/file.entity';
import { WorkItemFile } from './work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { WorkItemsEventHandler } from './work-items.event-handler';
import { WorkItemsStatusStats } from './work-items-status-stats.entity';
import { WorkItemsStatusLog } from './work-items-status-log.entity';

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
          Iteration,
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
        IterationsService,
        WorkItemsEventHandler,
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
