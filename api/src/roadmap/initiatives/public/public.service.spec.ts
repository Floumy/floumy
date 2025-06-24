import { PublicService } from './public.service';
import { UsersService } from '../../../users/users.service';
import { InitiativesService } from '../initiatives.service';
import { WorkItemsService } from '../../../backlog/work-items/work-items.service';
import { MilestonesService } from '../../milestones/milestones.service';
import { OkrsService } from '../../../okrs/okrs.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { FilesService } from '../../../files/files.service';
import { User } from '../../../users/user.entity';
import { Org } from '../../../orgs/org.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Initiative } from '../initiative.entity';
import { Milestone } from '../../milestones/milestone.entity';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';
import { Sprint } from '../../../sprints/sprint.entity';
import { File } from '../../../files/file.entity';
import { WorkItemFile } from '../../../backlog/work-items/work-item-file.entity';
import { InitiativeFile } from '../initiative-file.entity';
import { FilesStorageRepository } from '../../../files/files-storage.repository';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.entity';

describe('PublicService', () => {
  let usersService: UsersService;
  let service: PublicService;
  let orgsService: OrgsService;
  let user: User;
  let org: Org;
  let project: Project;
  let initiativesRepository: Repository<Initiative>;
  let bipRepository: Repository<BipSettings>;
  let orgsRepository: Repository<Org>;
  let projectsRepository: Repository<Project>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Initiative,
          User,
          Milestone,
          WorkItem,
          Sprint,
          File,
          WorkItemFile,
          InitiativeFile,
          BipSettings,
          Project,
        ]),
      ],
      [
        OkrsService,
        OrgsService,
        InitiativesService,
        UsersService,
        MilestonesService,
        WorkItemsService,
        FilesService,
        FilesStorageRepository,
        PublicService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    initiativesRepository = module.get<Repository<Initiative>>(
      getRepositoryToken(Initiative),
    );
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when getting a initiative', () => {
    it('should return a initiative', async () => {
      const initiative = new Initiative();
      initiative.title = 'Test Feature';
      initiative.org = Promise.resolve(org);
      initiative.project = Promise.resolve(project);
      await initiativesRepository.save(initiative);
      const actual = await service.getInitiative(
        org.id,
        project.id,
        initiative.id,
      );
      expect(actual).toBeDefined();
    });
    it('should throw an error if the org is not public', async () => {
      const newOrg = new Org();
      await orgsRepository.save(newOrg);
      const newProject = new Project();
      newProject.name = 'Test Project';
      newProject.org = Promise.resolve(newOrg);
      await projectsRepository.save(newProject);
      const bipSettings = new BipSettings();
      bipSettings.org = Promise.resolve(newOrg);
      bipSettings.project = Promise.resolve(newProject);
      bipSettings.isBuildInPublicEnabled = false;
      bipSettings.org = Promise.resolve(newOrg);
      await bipRepository.save(bipSettings);
      const initiative = new Initiative();
      initiative.title = 'Test Feature';
      initiative.org = Promise.resolve(newOrg);
      initiative.project = Promise.resolve(newProject);
      await initiativesRepository.save(initiative);
      await expect(
        service.getInitiative(newOrg.id, newProject.id, initiative.id),
      ).rejects.toThrow('Roadmap page is not public');
    });
    it('should throw an error if the initiative does not belong to the org', async () => {
      const newUser = await usersService.createUserWithOrg(
        'Test User',
        'new-user@example.com',
        'testtesttest',
      );
      const newOrg = await orgsService.createForUser(newUser);
      const initiative = new Initiative();
      initiative.title = 'Test Feature';
      initiative.org = Promise.resolve(newOrg);
      initiative.project = Promise.resolve(project);
      await initiativesRepository.save(initiative);
      await expect(
        service.getInitiative(org.id, project.id, initiative.id),
      ).rejects.toThrow();
    });
  });
});
