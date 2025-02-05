import { PublicController } from './public.controller';
import { MilestonesService } from '../../milestones/milestones.service';
import { Org } from '../../../orgs/org.entity';
import { User } from '../../../users/user.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Feature } from '../feature.entity';
import { Milestone } from '../../milestones/milestone.entity';
import { Sprint } from '../../../sprints/sprint.entity';
import { File } from '../../../files/file.entity';
import { FeatureFile } from '../feature-file.entity';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';
import { WorkItemFile } from '../../../backlog/work-items/work-item-file.entity';
import { UsersModule } from '../../../users/users.module';
import { BacklogModule } from '../../../backlog/backlog.module';
import { OkrsService } from '../../../okrs/okrs.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { TokensService } from '../../../auth/tokens.service';
import { FeaturesService } from '../features.service';
import { FilesService } from '../../../files/files.service';
import { FilesStorageRepository } from '../../../files/files-storage.repository';
import { UsersService } from '../../../users/users.service';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PublicService } from './public.service';
import { Project } from '../../../projects/project.entity';

describe('PublicController', () => {
  let controller: PublicController;
  let featuresRepository: Repository<Feature>;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;
  let orgsService: OrgsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          Objective,
          KeyResult,
          Feature,
          Milestone,
          Sprint,
          File,
          FeatureFile,
          WorkItem,
          WorkItemFile,
          BipSettings,
        ]),
        UsersModule,
        BacklogModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        FeaturesService,
        MilestonesService,
        FilesService,
        FilesStorageRepository,
        PublicService,
      ],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    const bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    featuresRepository = module.get<Repository<Feature>>(
      getRepositoryToken(Feature),
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
    await bipRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when getting the feature of an org', () => {
    it('should return the feature', async () => {
      const feature = new Feature();
      feature.title = 'Test Feature';
      feature.org = Promise.resolve(org);
      feature.project = Promise.resolve(project);
      await featuresRepository.save(feature);
      const result = await controller.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(result).toBeDefined();
      expect(result.id).toEqual(feature.id);
    });
    it('should throw an error if the feature does not belong to the org', async () => {
      const newUser = await usersService.createUserWithOrg(
        'Test User',
        'new-user@example.com',
        'testtesttest',
      );
      const newOrg = await orgsService.createForUser(newUser);
      const feature = new Feature();
      feature.title = 'Test Feature';
      feature.org = Promise.resolve(newOrg);
      feature.project = Promise.resolve(project);
      await featuresRepository.save(feature);
      await expect(
        controller.getFeature(org.id, project.id, feature.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
