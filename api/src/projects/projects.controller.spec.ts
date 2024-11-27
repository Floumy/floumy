import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { Org } from '../orgs/org.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ProjectsService } from './projects.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { setupTestingModule } from '../../test/test.utils';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;
  let projectsRepository: Repository<Project>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Project]), UsersModule],
      [ProjectsService],
      [ProjectsController],
    );
    cleanup = dbCleanup;
    controller = module.get<ProjectsController>(ProjectsController);
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
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when listing projects', () => {
    it('should return the list of projects', async () => {
      const newProject = new Project();
      newProject.name = 'Test Project';
      newProject.org = Promise.resolve(org);
      user.projects = Promise.resolve([newProject]);
      await projectsRepository.save(newProject);
      const projects = await controller.listProjects(
        {
          user: { org: org.id },
        },
        org.id,
      );
      expect(projects).toBeDefined();
      expect(projects.length).toEqual(2);
      expect(projects[0].id).toBeDefined();
      expect(projects[0].name).toEqual(newProject.name);
      expect(projects[1].id).toBeDefined();
      expect(projects[1].name).toEqual(project.name);
    });
  });

  describe('when creating a project', () => {
    it('should create a project', async () => {
      const createProjectDto = {
        name: 'Test Project',
      };
      await controller.createProject(
        {
          user: { org: org.id },
        },
        createProjectDto,
        org.id,
      );

      const projects = await controller.listProjects(
        {
          user: { org: org.id },
        },
        org.id,
      );

      expect(projects).toBeDefined();
      expect(projects.length).toEqual(3);
      expect(projects[0].id).toBeDefined();
      expect(projects[0].name).toEqual(project.name);
      expect(projects[1].id).toBeDefined();
      expect(projects[1].name).toEqual(createProjectDto.name);
    });
  });
});
