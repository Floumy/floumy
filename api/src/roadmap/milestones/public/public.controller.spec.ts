import { PublicController } from './public.controller';
import { Org } from '../../../orgs/org.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Milestone } from '../milestone.entity';
import { Feature } from '../../features/feature.entity';
import { UsersModule } from '../../../users/users.module';
import { BacklogModule } from '../../../backlog/backlog.module';
import { FilesModule } from '../../../files/files.module';
import { OkrsService } from '../../../okrs/okrs.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { TokensService } from '../../../auth/tokens.service';
import { UsersService } from '../../../users/users.service';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { PublicService } from './public.service';
import { Timeline } from '../../../common/timeline.enum';
import { MilestonesService } from '../milestones.service';
import { Project } from '../../../projects/project.entity';

describe('PublicController', () => {
  let controller: PublicController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let project: Project;
  let bipRepository: Repository<BipSettings>;
  let milestonesService: MilestonesService;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          Objective,
          KeyResult,
          Milestone,
          Feature,
          BipSettings,
          Project,
        ]),
        UsersModule,
        BacklogModule,
        FilesModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        PublicService,
        MilestonesService,
      ],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    milestonesService = module.get<MilestonesService>(MilestonesService);
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.isRoadmapPagePublic = true;
    bipSettings.org = Promise.resolve(org);
    bipSettings.project = Promise.resolve(project);
    await bipRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when listing milestones', () => {
    it('should return a list of milestones', async () => {
      const milestones = await controller.listMilestones(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(milestones).toEqual([]);
    });
  });

  describe('when getting a milestone', () => {
    it('should return the milestone', async () => {
      const milestone = await milestonesService.createMilestone(
        org.id,
        project.id,
        {
          title: 'test',
          description: 'test description',
          dueDate: '2023-02-02',
        },
      );

      const actual = await controller.findMilestone(
        org.id,
        project.id,
        milestone.id,
      );

      expect(actual.id).toEqual(milestone.id);
    });
  });
});
