import { PublicService } from './public.service';
import { UsersService } from '../../../users/users.service';
import { MilestonesService } from '../milestones.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { InitiativesService } from '../../initiatives/initiatives.service';
import { User } from '../../../users/user.entity';
import { Org } from '../../../orgs/org.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Milestone } from '../milestone.entity';
import { Initiative } from '../../initiatives/initiative.entity';
import { File } from '../../../files/file.entity';
import { InitiativeFile } from '../../initiatives/initiative-file.entity';
import { BacklogModule } from '../../../backlog/backlog.module';
import { FilesModule } from '../../../files/files.module';
import { OkrsService } from '../../../okrs/okrs.service';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { Timeline } from '../../../common/timeline.enum';
import { Project } from '../../../projects/project.entity';

describe('PublicService', () => {
  let usersService: UsersService;
  let service: PublicService;
  let orgsService: OrgsService;
  let initiativesRepository: Repository<Initiative>;
  let milestonesRepository: Repository<Milestone>;
  let user: User;
  let org: Org;
  let project: Project;
  let bipRepository: Repository<BipSettings>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Milestone,
          Initiative,
          User,
          Objective,
          KeyResult,
          File,
          InitiativeFile,
          BipSettings,
          Project,
        ]),
        BacklogModule,
        FilesModule,
      ],
      [
        OrgsService,
        PublicService,
        UsersService,
        InitiativesService,
        OkrsService,
        MilestonesService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    initiativesRepository = module.get<Repository<Initiative>>(
      getRepositoryToken(Initiative),
    );
    milestonesRepository = module.get<Repository<Milestone>>(
      getRepositoryToken(Milestone),
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

  async function createMilestone(
    title: string,
    initiatives: Initiative[] = [],
  ) {
    const milestone = new Milestone();
    milestone.org = Promise.resolve(org);
    milestone.project = Promise.resolve(project);
    milestone.title = title;
    milestone.description = 'Description';
    milestone.dueDate = new Date();
    milestone.initiatives = Promise.resolve(initiatives);
    return await milestonesRepository.save(milestone);
  }

  async function createInitiative(title: string) {
    const initiative = new Initiative();
    initiative.org = Promise.resolve(org);
    initiative.project = Promise.resolve(project);
    initiative.title = title;
    return await initiativesRepository.save(initiative);
  }

  describe('when listing milestones', () => {
    it('should return a list of milestones', async () => {
      const initiative1 = await createInitiative('Initiative 1');
      const initiative2 = await createInitiative('Initiative 2');
      const milestone1 = await createMilestone('Milestone 1', [
        initiative1,
        initiative2,
      ]);

      const initiative3 = await createInitiative('Initiative 3');
      const milestone2 = await createMilestone('Milestone 2', [initiative3]);

      const milestones = await service.listMilestones(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(milestones).toBeDefined();
      expect(milestones[0].title).toBe(milestone2.title);
      expect(milestones[0].initiatives.length).toBe(1);
      expect(milestones[0].initiatives[0].title).toBe('Initiative 3');
      expect(milestones.length).toBe(2);
      expect(milestones[1].title).toBe(milestone1.title);
      expect(milestones[1].initiatives.length).toBe(2);
      expect(milestones[1].initiatives[0].title).toBe('Initiative 1');
      expect(milestones[1].initiatives[1].title).toBe('Initiative 2');
    });
  });

  describe('when getting a milestone', () => {
    it('should return the milestone', async () => {
      const milestone = new Milestone();
      milestone.org = Promise.resolve(org);
      milestone.project = Promise.resolve(project);
      milestone.title = 'test';
      milestone.description = 'test description';
      milestone.dueDate = new Date();
      await milestonesRepository.save(milestone);

      const actual = await service.findMilestone(
        org.id,
        project.id,
        milestone.id,
      );

      expect(actual.id).toEqual(milestone.id);
    });
  });
});
