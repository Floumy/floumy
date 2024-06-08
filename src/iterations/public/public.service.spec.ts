import { PublicService } from './public.service';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { IterationsService } from '../iterations.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { Iteration } from '../Iteration.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { BacklogModule } from '../../backlog/backlog.module';
import { OkrsService } from '../../okrs/okrs.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { CreateOrUpdateIterationDto } from '../dtos';
import { Timeline } from '../../common/timeline.enum';
import { OrgsModule } from '../../orgs/orgs.module';

describe('PublicService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: PublicService;
  let iterationsService: IterationsService;
  let org: Org;
  let bipSettingsRepository: Repository<BipSettings>;
  let user: User;

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
          WorkItem,
          Iteration,
          File,
          WorkItemFile,
          FeatureFile,
          BipSettings,
        ]),
        OrgsModule,
        BacklogModule,
      ],
      [
        OkrsService,
        FeaturesService,
        UsersService,
        WorkItemsService,
        MilestonesService,
        IterationsService,
        PublicService,
        FilesService,
        FilesStorageRepository,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    iterationsService = module.get<IterationsService>(IterationsService);
    bipSettingsRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    await bipSettingsRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when listing iterations', () => {
    it('should return an empty array if there are no iterations', async () => {
      const result = await service.listIterationsForTimeline(
        org.id,
        Timeline.THIS_QUARTER,
      );
      expect(result).toEqual([]);
    });
    it('should return an array of iterations', async () => {
      const iteration = {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 2,
      } as CreateOrUpdateIterationDto;
      await iterationsService.create(org.id, iteration);
      const result = await service.listIterationsForTimeline(
        org.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toEqual(1);
      expect(result[0].goal).toEqual('Test Goal');
    });
  });

  describe('when getting an iteration by id', () => {
    it('should return an iteration', async () => {
      const iteration = await iterationsService.create(org.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await service.getIterationById(org.id, iteration.id);
      expect(result).toBeDefined();
    });
    it('should throw an error if the org does not have build in public enabled', async () => {
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = false;
      bipSettings.org = Promise.resolve(org);
      await bipSettingsRepository.save(bipSettings);
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getIterationById(org.id, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the iteration does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getIterationById(org.id, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getIterationById(nonExistentUUID, nonExistentUUID),
      ).rejects.toThrow();
    });
  });
  describe('when getting the active iteration', () => {
    it('should return the active iteration', async () => {
      const orgWithActiveIterations =
        await orgsService.getByInvitationTokenOrCreateWithNameAndPlan(
          null,
          'Test Org',
        );
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveIterationsPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveIterations);
      await bipSettingsRepository.save(bipSettings);

      const iteration = await iterationsService.create(
        orgWithActiveIterations.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );
      await iterationsService.startIteration(
        orgWithActiveIterations.id,
        iteration.id,
      );
      const result = await service.getActiveIteration(
        orgWithActiveIterations.id,
      );
      expect(result).toBeDefined();
      expect(result.goal).toEqual('Test Goal');
    });
    it('should return null if there is no active iteration', async () => {
      const orgWithActiveIterations =
        await orgsService.getByInvitationTokenOrCreateWithNameAndPlan(
          null,
          'Test Org',
        );
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveIterationsPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveIterations);
      await bipSettingsRepository.save(bipSettings);

      await iterationsService.create(orgWithActiveIterations.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });

      const result = await service.getActiveIteration(
        orgWithActiveIterations.id,
      );

      expect(result).toBeNull();
    });
    it('should throw an error if the org does not have build in public enabled', async () => {
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = false;
      bipSettings.org = Promise.resolve(org);
      await bipSettingsRepository.save(bipSettings);
      await expect(service.getActiveIteration(org.id)).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getActiveIteration(nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not have active iterations page public enabled', async () => {
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveIterationsPagePublic = false;
      bipSettings.org = Promise.resolve(org);
      await bipSettingsRepository.save(bipSettings);
      await expect(service.getActiveIteration(org.id)).rejects.toThrow();
    });
  });
});
