import { ProjectsService } from './projects.service';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { Project } from './project.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { OrgsService } from '../orgs/orgs.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let user: User;
  let org: Org;
  let project: Project;
  let projectsRepository: Repository<Project>;
  let usersService: UsersService;
  let orgsService: OrgsService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Project, User])],
      [ProjectsService, UsersService],
    );
    service = module.get<ProjectsService>(ProjectsService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
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
      project.users = Promise.resolve([user]);
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

  describe('when creating a project', () => {
    it('should create a project', async () => {
      const createProjectDto = {
        name: 'Test Project',
      };
      await service.createProject(user.id, org.id, createProjectDto);
      const projects = await service.listProjects(org.id);
      expect(projects).toBeDefined();
      expect(projects.length).toEqual(2);
      expect(projects[0].id).toBeDefined();
      expect(projects[0].name).toEqual(createProjectDto.name);
      expect(projects[1].id).toBeDefined();
      expect(projects[1].name).toEqual(project.name);
    });
    it('should add the project to the user', async () => {
      const createProjectDto = {
        name: 'Test Project',
      };
      await service.createProject(user.id, org.id, createProjectDto);
      const userProjects = await user.projects;
      expect(userProjects).toBeDefined();
      expect(userProjects.length).toEqual(1);
      expect(userProjects[0].id).toBeDefined();
      expect(userProjects[0].name).toEqual(createProjectDto.name);
    });
    it('should throw an error if the user does not exist', async () => {
      await expect(
        service.createProject('non-existent-user', org.id, {
          name: 'Test Project',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(
        service.createProject(user.id, 'non-existent-org', {
          name: 'Test Project',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not belong to the user', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Test User',
        'other.user@example.com',
        'testtesttest',
      );
      const otherOrg = await orgsService.createForUser(otherUser);
      await expect(
        service.createProject(user.id, otherOrg.id, {
          name: 'Test Project',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the org is not provided', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Test User',
        'other.users@example.com',
        'testtesttest',
      );
      await expect(
        service.createProject(otherUser.id, null, {
          name: 'Test Project',
        }),
      ).rejects.toThrow();
    });
  });
});
