import { OkrsService } from './okrs.service';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective, ObjectiveLevel } from './objective.entity';
import { OrgsService } from '../orgs/orgs.service';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { KeyResult } from './key-result.entity';
import { Repository } from 'typeorm';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { UsersService } from '../users/users.service';
import { Timeline } from '../common/timeline.enum';
import { ObjectiveStatus } from './okrstatus.enum';
import { Project } from '../projects/project.entity';

describe('OkrsService', () => {
  let service: OkrsService;
  let orgsService: OrgsService;
  let featuresRepository: Repository<Initiative>;
  let projectsRepository: Repository<Project>;
  let usersService: UsersService;
  let org: Org;
  let project: Project;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Initiative, User])],
      [OkrsService, OrgsService, UsersService],
    );
    cleanup = dbCleanup;
    service = module.get<OkrsService>(OkrsService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    featuresRepository = module.get<Repository<Initiative>>(
      getRepositoryToken(Initiative),
    );
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    const user = new User('Test User', 'testuser@example.com', 'testtesttest');
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  async function createTestOrg() {
    const user = new User('Test User', 'test@example.com', 'testtesttest');
    const org = await orgsService.createForUser(user);
    const project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);
    return { org, user, project };
  }

  describe('when creating an objective', () => {
    it('should return the objective', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      expect(objective).toBeDefined();
      expect(objective.id).toBeDefined();
      expect(objective.status).toEqual(ObjectiveStatus.ON_TRACK);
      expect(objective.level).toEqual(ObjectiveLevel.PROJECT);
      expect(objective.createdAt).toBeDefined();
      expect(objective.updatedAt).toBeDefined();
    });
    it('should store the objective', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const storedObjective = await service.findObjectiveById(objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.title).toEqual(objective.title);
      expect(storedObjective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.updatedAt).toEqual(objective.updatedAt);
    });

    it('should validate the objective', async () => {
      await expect(
        service.createObjective(org.id, project.id, { title: '' }),
      ).rejects.toThrow();
    });

    it('should assign the objective to the org', async () => {
      const { org: testOrg, project } = await createTestOrg();
      const objective = await service.createObjective(testOrg.id, project.id, {
        title: 'Test Objective',
      });
      const storedObjective = await service.findObjectiveById(objective.id);
      const org = await storedObjective.org;
      expect(org).not.toBeNull();
      expect(org.id).toEqual(testOrg.id);
    });

    it('should validate the timeline', async () => {
      await expect(
        service.createObjective(org.id, project.id, {
          title: 'Test Objective',
          timeline: 'invalid',
        }),
      ).rejects.toThrow();
    });

    it('should assign the objective to a user', async () => {
      const user = await usersService.createUserWithOrg(
        'Test User',
        'testing@example.com',
        'testtesttest',
      );
      const org = await user.org;
      const project = new Project();
      project.name = 'Test Project';
      project.org = Promise.resolve(org);
      await projectsRepository.save(project);
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        assignedTo: user.id,
      });
      const storedObjective = await service.findObjectiveById(objective.id);
      const assignedTo = await storedObjective.assignedTo;
      expect(assignedTo).not.toBeNull();
    });
  });

  describe('when listing objectives', () => {
    it('should return an empty array', async () => {
      const objectives = await service.list(org.id, project.id);
      expect(objectives).toEqual([]);
    });
    it('should return an array of objectives', async () => {
      await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const objectives = await service.list(org.id, project.id);
      expect(objectives).toHaveLength(1);
      expect(objectives[0].title).toEqual('Test Objective');
    });
  });

  describe('when getting an objective', () => {
    it('should return the objective', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const storedObjective = await service.get(
        org.id,
        project.id,
        objective.id,
      );
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual(objective.title);
      expect(storedObjective.objective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.objective.updatedAt).toEqual(objective.updatedAt);
    });
  });

  describe('when updating an objective', () => {
    it('should update the values in db', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const okrDto = {
        title: 'Updated Objective',
        status: ObjectiveStatus.COMPLETED,
      };
      await service.updateObjective(org.id, project.id, objective.id, okrDto);
      const storedObjective = await service.get(
        org.id,
        project.id,
        objective.id,
      );
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual('Updated Objective');
      expect(storedObjective.objective.status).toEqual(
        ObjectiveStatus.COMPLETED.valueOf(),
      );
    });
    it('should update objective timeline', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const okrDto = {
        title: 'Updated Objective',
        status: objective.status,
        timeline: 'this-quarter',
      };
      await service.updateObjective(org.id, project.id, objective.id, okrDto);
      const storedObjective = await service.get(
        org.id,
        project.id,
        objective.id,
      );
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.timeline).toEqual('this-quarter');
    });
  });

  it('should update the assigned user', async () => {
    const user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    const org = await user.org;
    const project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);
    const objective = await service.createObjective(org.id, project.id, {
      title: 'Test Objective',
    });
    const okrDto = {
      title: 'Updated Objective',
      status: objective.status,
      description: 'Updated Objective Description',
      assignedTo: user.id,
    };
    await service.updateObjective(org.id, project.id, objective.id, okrDto);
    const storedObjective = await service.get(org.id, project.id, objective.id);
    expect(storedObjective).toBeDefined();
    const assignedTo = storedObjective.objective.assignedTo;
    expect(assignedTo).not.toBeNull();
  });
  it('should update the assigned user to null', async () => {
    const user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    const org = await user.org;
    const project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);
    const objective = await service.createObjective(org.id, project.id, {
      title: 'Test Objective',
    });
    const okrDto = {
      title: 'Updated Objective',
      status: objective.status,
      description: 'Updated Objective Description',
      assignedTo: null,
    };
    await service.updateObjective(org.id, project.id, objective.id, okrDto);
    const storedObjective = await service.get(org.id, project.id, objective.id);
    expect(storedObjective).toBeDefined();
    const assignedTo = storedObjective.objective.assignedTo;
    expect(assignedTo).toBeUndefined();
  });

  describe('when deleting an objective', () => {
    it('should delete the objective', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      await service.delete(org.id, project.id, objective.id);
      await expect(
        service.get(org.id, project.id, objective.id),
      ).rejects.toThrow();
    });
    it('should delete the key results', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      await service.createKeyResultFor(objective, 'Test Key Result');
      await service.delete(org.id, project.id, objective.id);
      await expect(
        service.get(org.id, project.id, objective.id),
      ).rejects.toThrow();
    });
    it('should remove the key results from the associated feature', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        timeline: 'this-quarter',
      });
      const keyResult = await service.createKeyResultFor(
        objective,
        'Test Key Result',
      );
      const feature = new Initiative();
      feature.org = Promise.resolve(org);
      feature.title = 'Test Feature';
      feature.description = '';
      feature.keyResult = Promise.resolve(keyResult);
      feature.project = Promise.resolve(project);
      await featuresRepository.save(feature);
      await service.delete(org.id, project.id, objective.id);
      const storedFeature = await featuresRepository.findOne({
        where: { id: feature.id },
      });
      expect(storedFeature).toBeDefined();
      expect(await storedFeature.keyResult).toBeNull();
    });
  });

  describe('when creating an OKR', () => {
    it('should return the OKR', async () => {
      const okr = await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      expect(okr).toBeDefined();
      expect(okr.objective.id).toBeDefined();
      expect(okr.objective.createdAt).toBeDefined();
      expect(okr.objective.updatedAt).toBeDefined();
      expect(okr.objective.title).toEqual('My OKR');
      expect(okr.keyResults).toHaveLength(3);
    });

    it('should store the OKR', async () => {
      const okr = await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      const storedObjective = await service.get(
        org.id,
        project.id,
        okr.objective.id,
      );
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual(okr.objective.title);
      expect(storedObjective.objective.createdAt).toEqual(
        okr.objective.createdAt,
      );
      expect(storedObjective.objective.updatedAt).toEqual(
        okr.objective.updatedAt,
      );
      expect(okr.keyResults).toHaveLength(3);
      expect(okr.keyResults[0].id).toBeDefined();
      expect(okr.keyResults[0].createdAt).toBeDefined();
      expect(okr.keyResults[0].updatedAt).toBeDefined();
      expect(okr.keyResults[0].title).toEqual('My KR 1');
      expect(okr.keyResults[1].id).toBeDefined();
      expect(okr.keyResults[1].createdAt).toBeDefined();
      expect(okr.keyResults[1].updatedAt).toBeDefined();
      expect(okr.keyResults[1].title).toEqual('My KR 2');
      expect(okr.keyResults[2].id).toBeDefined();
      expect(okr.keyResults[2].createdAt).toBeDefined();
      expect(okr.keyResults[2].updatedAt).toBeDefined();
      expect(okr.keyResults[2].title).toEqual('My KR 3');
    });
  });
  describe('when updating a KR progress', () => {
    it('should update the KR progress', async () => {
      const okr = await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      await service.patchKeyResult(
        org.id,
        project.id,
        okr.objective.id,
        okr.keyResults[0].id,
        { progress: 0.5 },
      );
      const updatedKR = await service.getKeyResultBy(okr.keyResults[0].id);
      expect(updatedKR.progress).toEqual(0.5);
    });
    it('should update the objective progress', async () => {
      const okr = await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      await service.patchKeyResult(
        org.id,
        project.id,
        okr.objective.id,
        okr.keyResults[0].id,
        { progress: 0.5 },
      );
      await service.patchKeyResult(
        org.id,
        project.id,
        okr.objective.id,
        okr.keyResults[1].id,
        { progress: 0.5 },
      );
      await service.patchKeyResult(
        org.id,
        project.id,
        okr.objective.id,
        okr.keyResults[2].id,
        { progress: 0.5 },
      );
      const updatedObjective = await service.getObjective(okr.objective.id);
      expect(updatedObjective.progress).toEqual(0.5);
    });
  });
  describe('when updating the key result status', () => {
    it('should update the key result status', async () => {
      const okr = await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      await service.patchKeyResult(
        org.id,
        project.id,
        okr.objective.id,
        okr.keyResults[0].id,
        { status: 'off-track' },
      );
      const updatedKR = await service.getKeyResultBy(okr.keyResults[0].id);
      expect(updatedKR.status).toEqual('off-track');
    });
    it('should be able to update the key result progress to 0', async () => {
      const okr = await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      await service.patchKeyResult(
        org.id,
        project.id,
        okr.objective.id,
        okr.keyResults[0].id,
        { progress: 0 },
      );
      const updatedKR = await service.getKeyResultBy(okr.keyResults[0].id);
      expect(updatedKR.progress).toEqual(0);
    });
  });
  describe('when updating a key result title', () => {
    it('should update the key result title', async () => {
      const okr = await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      await service.patchKeyResult(
        org.id,
        project.id,
        okr.objective.id,
        okr.keyResults[0].id,
        { title: 'Updated KR 1' },
      );
      const updatedKR = await service.getKeyResultBy(okr.keyResults[0].id);
      expect(updatedKR.title).toEqual('Updated KR 1');
    });
  });
  describe('when listing key results', () => {
    it('should return an empty array', async () => {
      const keyResults = await service.listKeyResults(org.id, project.id);
      expect(keyResults).toEqual([]);
    });
    it('should return an array of key results', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      await service.createKeyResultFor(objective, 'Test Key Result');
      const keyResults = await service.listKeyResults(org.id, project.id);
      expect(keyResults).toHaveLength(1);
      expect(keyResults[0].title).toEqual('Test Key Result');
    });
  });
  describe('when deleting a key result', () => {
    it('should delete the key result', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        timeline: 'this-quarter',
      });
      const keyResult = await service.createKeyResultFor(
        objective,
        'Test Key Result',
      );
      await service.deleteKeyResult(
        org.id,
        project.id,
        objective.id,
        keyResult.id,
      );
      await expect(service.getKeyResultBy(keyResult.id)).rejects.toThrow();
    });
    it('should update the objective progress', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        timeline: 'this-quarter',
      });
      const keyResult = await service.createKeyResultFor(
        objective,
        'Test Key Result',
      );
      await service.patchKeyResult(
        org.id,
        project.id,
        objective.id,
        keyResult.id,
        {
          progress: 0.5,
        },
      );
      await service.deleteKeyResult(
        org.id,
        project.id,
        objective.id,
        keyResult.id,
      );
      const updatedObjective = await service.getObjective(objective.id);
      expect(updatedObjective.progress).toEqual(0);
    });
  });
  describe('when updating a key result', () => {
    it('should update the key result', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        timeline: 'this-quarter',
      });
      const keyResult = await service.createKeyResultFor(
        objective,
        'Test Key Result',
      );
      await service.updateKeyResult(
        org.id,
        project.id,
        objective.id,
        keyResult.id,
        {
          title: 'Updated Key Result',
          progress: 0.5,
          status: 'off-track',
        },
      );
      const updatedKR = await service.getKeyResultBy(keyResult.id);
      expect(updatedKR.title).toEqual('Updated Key Result');
      expect(updatedKR.progress).toEqual(0.5);
      expect(updatedKR.status).toEqual('off-track');
    });
    it('should update the objective progress', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        timeline: 'this-quarter',
      });
      const keyResult = await service.createKeyResultFor(
        objective,
        'Test Key Result',
      );
      await service.updateKeyResult(
        org.id,
        project.id,
        objective.id,
        keyResult.id,
        {
          title: 'Updated Key Result',
          progress: 0.5,
          status: 'off-track',
        },
      );
      const updatedObjective = await service.getObjective(objective.id);
      expect(updatedObjective.progress).toEqual(0.5);
    });
  });
  describe('when creating a key result', () => {
    it('should create the key result', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        timeline: 'this-quarter',
      });
      const keyResult = await service.createKeyResult(org.id, objective.id, {
        title: 'Test Key Result',
        progress: 0.5,
        status: 'off-track',
      });
      const storedKR = await service.getKeyResultBy(keyResult.id);
      expect(storedKR.title).toEqual('Test Key Result');
      expect(storedKR.progress).toEqual(0.5);
      expect(storedKR.status).toEqual('off-track');
    });
    it('should update the objective progress', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
        timeline: 'this-quarter',
      });
      await service.createKeyResult(org.id, objective.id, {
        title: 'Test Key Result',
        progress: 0.5,
        status: 'off-track',
      });
      const updatedObjective = await service.getObjective(objective.id);
      expect(updatedObjective.progress).toEqual(0.5);
    });
  });
  describe('when getting a key result', () => {
    it('should return the key result', async () => {
      const objective = await service.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const keyResult = await service.createKeyResultFor(
        objective,
        'Test Key Result',
      );
      const storedKR = await service.getKeyResultDetail(
        org.id,
        project.id,
        objective.id,
        keyResult.id,
      );
      expect(storedKR.title).toEqual('Test Key Result');
      expect(storedKR.progress).toEqual(0);
      expect(storedKR.status).toEqual('on-track');
    });
  });
  describe('when listing okrs for timeline', () => {
    it('should return an empty array', async () => {
      const okrs = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(okrs).toEqual([]);
    });
    it('should return an array of okrs', async () => {
      await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
          timeline: 'this-quarter',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      const okrs = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(okrs).toHaveLength(1);
      expect(okrs[0].title).toEqual('My OKR');
    });
    it('should return the okrs for the past', async () => {
      await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
          timeline: 'this-quarter',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      const okrs = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.PAST,
      );
      expect(okrs).toHaveLength(0);
    });
    it('should return the okrs for later', async () => {
      await service.create(org.id, project.id, {
        objective: {
          title: 'My OKR',
          timeline: 'this-quarter',
        },
        keyResults: [
          { title: 'My KR 1' },
          { title: 'My KR 2' },
          { title: 'My KR 3' },
        ],
      });
      await service.create(org.id, project.id, {
        objective: {
          title: 'My Other OKR',
          timeline: 'later',
        },
        keyResults: [{ title: 'My Other KR 1' }],
      });
      const okrs = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.LATER,
      );
      expect(okrs).toHaveLength(1);
      expect(okrs[0].title).toEqual('My Other OKR');
    });
  });
});
