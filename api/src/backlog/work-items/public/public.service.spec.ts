import { PublicService } from './public.service';
import { UsersService } from '../../../users/users.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { FeaturesService } from '../../../roadmap/features/features.service';
import { SprintsService } from '../../../sprints/sprints.service';
import { Repository } from 'typeorm';
import { File } from '../../../files/file.entity';
import { WorkItemsService } from '../work-items.service';
import { Org } from '../../../orgs/org.entity';
import { User } from '../../../users/user.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Feature } from '../../../roadmap/features/feature.entity';
import { Milestone } from '../../../roadmap/milestones/milestone.entity';
import { Sprint } from '../../../sprints/sprint.entity';
import { WorkItem } from '../work-item.entity';
import { FeatureFile } from '../../../roadmap/features/feature-file.entity';
import { WorkItemFile } from '../work-item-file.entity';
import { OkrsService } from '../../../okrs/okrs.service';
import { MilestonesService } from '../../../roadmap/milestones/milestones.service';
import { FilesService } from '../../../files/files.service';
import { FilesStorageRepository } from '../../../files/files-storage.repository';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { WorkItemStatus } from '../work-item-status.enum';
import { Priority } from '../../../common/priority.enum';
import { Project } from '../../../projects/project.entity';

describe('PublicService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let org: Org;
  let bipSettingsRepository: Repository<BipSettings>;
  let orgsRepository: Repository<Org>;
  let workItemsRepository: Repository<WorkItem>;
  let user: User;
  let project: Project;
  let service: PublicService;

  let cleanup: () => Promise<void>;

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
          BipSettings,
          Project,
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
        FilesService,
        FilesStorageRepository,
        PublicService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    bipSettingsRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    workItemsRepository = module.get<Repository<WorkItem>>(
      getRepositoryToken(WorkItem),
    );
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    bipSettings.project = Promise.resolve(project);
    await bipSettingsRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('get work item by id', () => {
    it('should return work item', async () => {
      const workItem = new WorkItem();
      workItem.title = 'Test work item';
      workItem.description = 'Test description';
      workItem.priority = Priority.HIGH;
      workItem.status = WorkItemStatus.CLOSED;
      workItem.org = Promise.resolve(org);
      workItem.project = Promise.resolve(project);
      await workItemsRepository.save(workItem);
      await orgsRepository.save(org);
      await service.getWorkItem(org.id, project.id, workItem.id);
    });
    it('should throw not found exception', async () => {
      const workItem = new WorkItem();
      workItem.title = 'Test work item';
      workItem.description = 'Test description';
      workItem.priority = Priority.HIGH;
      workItem.status = WorkItemStatus.CLOSED;
      workItem.org = Promise.resolve(org);
      workItem.project = Promise.resolve(project);
      await workItemsRepository.save(workItem);
      await orgsRepository.save(org);
      await expect(
        service.getWorkItem(org.id, project.id, 'invalid_id'),
      ).rejects.toThrow();
    });
  });
});
