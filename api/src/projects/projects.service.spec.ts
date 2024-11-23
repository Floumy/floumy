import { ProjectsService } from './projects.service';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { Project } from './project.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let user: User;
  let org: Org;
  let projectsRepository: Repository<Project>;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Project, User])],
      [ProjectsService, UsersService],
    );
    service = module.get<ProjectsService>(ProjectsService);
    const usersService = module.get<UsersService>(UsersService);
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await user.org;
    cleanup = dbCleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when listing projects', () => {
    it('should return the list of projects', async () => {
      const project = new Project();
      project.name = 'Test Project';
      project.org = Promise.resolve(org);
      user.projects = Promise.resolve([project]);
      await projectsRepository.save(project);
      const projects = await service.listProjects(org.id);
      expect(projects).toBeDefined();
      expect(projects.length).toEqual(2);
      expect(projects[0].id).toBeDefined();
      expect(projects[0].name).toEqual('Test Project');
      expect(projects[1].id).toBeDefined();
      expect(projects[1].name).toEqual('Default Project');
    });
  });
});
