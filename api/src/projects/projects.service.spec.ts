import { ProjectsService } from './projects.service';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { Project } from './project.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { OrgsService } from '../orgs/orgs.service';
import { FilesModule } from '../files/files.module';

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
      [TypeOrmModule.forFeature([Project, User]), FilesModule],
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
        description: 'Test Project Description',
      };
      await service.createProject(user.id, org.id, createProjectDto);
      const projects = await service.listProjects(org.id);
      expect(projects).toBeDefined();
      expect(projects.length).toEqual(2);
      expect(projects[0].id).toBeDefined();
      expect(projects[0].name).toEqual(createProjectDto.name);
      expect(projects[0].description).toEqual(createProjectDto.description);
      expect(projects[1].id).toBeDefined();
      expect(projects[1].name).toEqual(project.name);
    });
    it('should create a project without a description', async () => {
      const createProjectDto = {
        name: 'Test Project',
      };
      await service.createProject(user.id, org.id, createProjectDto);
      const projects = await service.listProjects(org.id);
      expect(projects).toBeDefined();
      expect(projects.length).toEqual(2);
      expect(projects[0].id).toBeDefined();
      expect(projects[0].name).toEqual(createProjectDto.name);
      expect(projects[0].description).toBeNull();
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
        service.createProject(otherUser.id, '', {
          name: 'Test Project',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name is already taken', async () => {
      await service.createProject(user.id, org.id, {
        name: 'Test Project',
      });
      await expect(
        service.createProject(user.id, org.id, {
          name: 'Test Project',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name is empty', async () => {
      await expect(
        service.createProject(user.id, org.id, {
          name: '',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name is too long', async () => {
      await expect(
        service.createProject(user.id, org.id, {
          name: 'a'.repeat(51),
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name contains invalid characters', async () => {
      await expect(
        service.createProject(user.id, org.id, {
          name: 'a~b',
        }),
      ).rejects.toThrow();
    });
  });

  describe('when updating a project', () => {
    it('should update the project', async () => {
      const updateProjectDto = {
        name: 'Updated Project',
        description: 'Updated Description',
      };
      await service.updateProject(org.id, project.id, updateProjectDto);
      const updatedProject = await service.findOneById(org.id, project.id);
      expect(updatedProject).toBeDefined();
      expect(updatedProject.id).toEqual(project.id);
      expect(updatedProject.name).toEqual(updateProjectDto.name);
      expect(updatedProject.description).toEqual(updatedProject.description);
    });
    it('should update the project without a description', async () => {
      const updateProjectDto = {
        name: 'Updated Project',
      };
      await service.updateProject(org.id, project.id, updateProjectDto);
      const updatedProject = await service.findOneById(org.id, project.id);
      expect(updatedProject).toBeDefined();
      expect(updatedProject.id).toEqual(project.id);
      expect(updatedProject.name).toEqual(updateProjectDto.name);
      expect(updatedProject.description).toBeNull();
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(
        service.updateProject(org.id, 'non-existent-project', {
          name: 'Updated Project',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project does not belong to the org', async () => {
      const project = new Project();
      project.name = 'Test Project';
      project.org = Promise.resolve(new Org());
      await projectsRepository.save(project);
      await expect(
        service.updateProject(org.id, project.id, { name: 'Updated Project' }),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(
        service.updateProject('non-existent-org', project.id, {
          name: 'Updated Project',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name is empty', async () => {
      await expect(
        service.updateProject(org.id, project.id, { name: '' }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name is too long', async () => {
      await expect(
        service.updateProject(org.id, project.id, { name: 'a'.repeat(51) }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name contains invalid characters', async () => {
      await expect(
        service.updateProject(org.id, project.id, { name: 'a~b' }),
      ).rejects.toThrow();
    });
    it('should throw an error if the project name is already taken', async () => {
      await service.createProject(user.id, org.id, {
        name: 'Test Project',
      });
      await expect(
        service.updateProject(org.id, project.id, { name: 'Test Project' }),
      ).rejects.toThrow();
    });
  });
  describe('when getting a project', () => {
    it('should get the project', async () => {
      const currentProject = await service.findOneById(org.id, project.id);
      expect(currentProject).toBeDefined();
      expect(currentProject.id).toEqual(currentProject.id);
      expect(currentProject.name).toEqual(currentProject.name);
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(
        service.findOneById(org.id, 'non-existent-project'),
      ).rejects.toThrow();
    });
    it('should throw an error if the project does not belong to the org', async () => {
      const project = new Project();
      project.name = 'Test Project';
      project.org = Promise.resolve(new Org());
      await projectsRepository.save(project);
      await expect(service.findOneById(org.id, project.id)).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(
        service.findOneById('non-existent-org', project.id),
      ).rejects.toThrow();
    });
  });
  describe('when deleting a project', () => {
    it('should delete the project', async () => {
      await service.createProject(user.id, org.id, {
        name: 'Test Project',
      });
      await service.deleteProject(org.id, project.id);
      const projects = await service.listProjects(org.id);
      expect(projects).toBeDefined();
      expect(projects.length).toEqual(1);
      expect(projects[0].id).toBeDefined();
      expect(projects[0].name).toEqual('Test Project');
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(
        service.deleteProject(org.id, 'non-existent-project'),
      ).rejects.toThrow();
    });
    it('should throw an error if the project does not belong to the org', async () => {
      const project = new Project();
      project.name = 'Test Project';
      project.org = Promise.resolve(new Org());
      await projectsRepository.save(project);
      await expect(service.deleteProject(org.id, project.id)).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(
        service.deleteProject('non-existent-org', project.id),
      ).rejects.toThrow();
    });
    it('should throw an error if the project is the only one', async () => {
      await expect(service.deleteProject(org.id, project.id)).rejects.toThrow();
    });
  });
});
