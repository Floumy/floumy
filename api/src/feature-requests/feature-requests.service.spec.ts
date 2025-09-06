import { FeatureRequestsService } from './feature-requests.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { uuid } from 'uuidv4';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { FeatureRequestComment } from './feature-request-comment.entity';
import { Project } from '../projects/project.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';

describe('FeatureRequestsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: FeatureRequestsService;
  let orgsRepository: Repository<Org>;
  let projectsRepository: Repository<Project>;
  let featuresRepository: Repository<Initiative>;
  let featureRequestsRepository: Repository<FeatureRequest>;
  let org: Org;
  let project: Project;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
          Initiative,
          FeatureRequest,
          FeatureRequestVote,
          FeatureRequestComment,
        ]),
      ],
      [FeatureRequestsService, UsersService, OrgsService],
    );
    cleanup = dbCleanup;
    service = module.get<FeatureRequestsService>(FeatureRequestsService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    featuresRepository = module.get<Repository<Initiative>>(
      getRepositoryToken(Initiative),
    );
    featureRequestsRepository = module.get<Repository<FeatureRequest>>(
      getRepositoryToken(FeatureRequest),
    );
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);

    await orgsRepository.save(org);
    project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when adding a new feature request', () => {
    it('should create a new feature request', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      expect(featureRequest).toBeDefined();
      expect(featureRequest.id).toBeDefined();
      expect(featureRequest.title).toEqual('Test Feature Request');
      expect(featureRequest.description).toEqual('Test Description');
      expect(featureRequest.status).toEqual(FeatureRequestStatus.PENDING);
      expect(featureRequest.estimation).toBeNull();
      expect(featureRequest.completedAt).toBeNull();
      expect(featureRequest.org).toBeDefined();
      expect(featureRequest.createdBy).toBeDefined();
    });
  });

  describe('when listing feature requests', () => {
    it('should return all feature requests for the org', async () => {
      await service.addFeatureRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 1',
        description: 'Test Description 1',
      });
      await service.addFeatureRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 2',
        description: 'Test Description 2',
      });

      const featureRequests = await service.listFeatureRequests(
        org.id,
        project.id,
      );
      expect(featureRequests).toHaveLength(2);
      expect(featureRequests[0].title).toEqual('Test Feature Request 2');
      expect(featureRequests[1].title).toEqual('Test Feature Request 1');
    });
    it('should return an empty array if there are no feature requests', async () => {
      const featureRequests = await service.listFeatureRequests(
        org.id,
        project.id,
      );
      expect(featureRequests).toHaveLength(0);
    });
    it('should return the feature requests in pages', async () => {
      await service.addFeatureRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 1',
        description: 'Test Description 1',
      });
      await service.addFeatureRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 2',
        description: 'Test Description 2',
      });

      const featureRequests = await service.listFeatureRequests(
        org.id,
        project.id,
        1,
        1,
      );
      expect(featureRequests).toHaveLength(1);
      expect(featureRequests[0].title).toEqual('Test Feature Request 2');
    });
  });

  describe('when getting a feature request by id', () => {
    it('should return the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      const foundFeatureRequest = await service.getFeatureRequestById(
        org.id,
        project.id,
        featureRequest.id,
      );
      expect(foundFeatureRequest).toBeDefined();
      expect(foundFeatureRequest.id).toEqual(featureRequest.id);
      expect(foundFeatureRequest.title).toEqual('Test Feature Request');
      expect(foundFeatureRequest.description).toEqual('Test Description');
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.getFeatureRequestById(org.id, project.id, uuid()),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);
      const otherOrgProject = new Project();
      otherOrgProject.name = 'Test Project';
      otherOrgProject.org = Promise.resolve(otherOrg);
      await projectsRepository.save(otherOrgProject);

      await expect(
        service.getFeatureRequestById(
          otherOrg.id,
          otherOrgProject.id,
          featureRequest.id,
        ),
      ).rejects.toThrow();
    });
  });

  describe('when updating a feature request', () => {
    it('should update the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      const updatedFeatureRequest = await service.updateFeatureRequest(
        user.id,
        org.id,
        project.id,
        featureRequest.id,
        {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: FeatureRequestStatus.IN_PROGRESS,
          estimation: 5,
        },
      );

      expect(updatedFeatureRequest).toBeDefined();
      expect(updatedFeatureRequest.id).toEqual(featureRequest.id);
      expect(updatedFeatureRequest.title).toEqual('Updated Feature Request');
      expect(updatedFeatureRequest.description).toEqual('Updated Description');
      expect(updatedFeatureRequest.status).toEqual(
        FeatureRequestStatus.IN_PROGRESS,
      );
      expect(updatedFeatureRequest.estimation).toEqual(5);
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.updateFeatureRequest(user.id, org.id, project.id, uuid(), {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: FeatureRequestStatus.IN_PROGRESS,
          estimation: 5,
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);
      const otherOrgProject = new Project();
      otherOrgProject.name = 'Test Project';
      otherOrgProject.org = Promise.resolve(otherOrg);
      await projectsRepository.save(otherOrgProject);

      await expect(
        service.updateFeatureRequest(
          user.id,
          otherOrg.id,
          otherOrgProject.id,
          featureRequest.id,
          {
            title: 'Updated Feature Request',
            description: 'Updated Description',
            status: FeatureRequestStatus.IN_PROGRESS,
            estimation: 5,
          },
        ),
      ).rejects.toThrow();
    });
    it('should throw an error if the user does not belong to the org', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otheruser@exmaple.com',
        'testtesttest',
      );

      await expect(
        service.updateFeatureRequest(
          otherUser.id,
          org.id,
          project.id,
          featureRequest.id,
          {
            title: 'Updated Feature Request',
            description: 'Updated Description',
            status: FeatureRequestStatus.IN_PROGRESS,
            estimation: 5,
          },
        ),
      ).rejects.toThrow();
    });
  });
  describe('when deleting a feature request', () => {
    it('should delete the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      await service.deleteFeatureRequest(
        user.id,
        org.id,
        project.id,
        featureRequest.id,
      );

      await expect(
        service.getFeatureRequestById(org.id, project.id, featureRequest.id),
      ).rejects.toThrow();
    });
  });
  it('should throw an error if the feature request does not exist', async () => {
    await expect(
      service.deleteFeatureRequest(user.id, org.id, project.id, uuid()),
    ).rejects.toThrow();
  });
  it('should throw an error if the feature request does not belong to the org', async () => {
    const featureRequest = await service.addFeatureRequest(
      user.id,
      org.id,
      project.id,
      {
        title: 'Test Feature Request',
        description: 'Test Description',
      },
    );

    const otherOrg = await orgsService.createForUser(user);
    await orgsRepository.save(otherOrg);
    const otherOrgProject = new Project();
    otherOrgProject.name = 'Test Project';
    otherOrgProject.org = Promise.resolve(otherOrg);
    await projectsRepository.save(otherOrgProject);

    await expect(
      service.deleteFeatureRequest(
        user.id,
        otherOrg.id,
        otherOrgProject.id,
        featureRequest.id,
      ),
    ).rejects.toThrow();
  });
  it('should remove the feature request from the initiatives', async () => {
    const featureRequest = new FeatureRequest();
    featureRequest.title = 'Test Feature Request';
    featureRequest.description = 'Test Description';
    featureRequest.org = Promise.resolve(org);
    featureRequest.project = Promise.resolve(project);
    featureRequest.createdBy = Promise.resolve(user);
    await featureRequestsRepository.save(featureRequest);
    const feature = new Initiative();
    feature.title = 'Test Feature';
    feature.description = 'Test Description';
    feature.org = Promise.resolve(org);
    feature.createdBy = Promise.resolve(user);
    feature.project = Promise.resolve(project);
    feature.featureRequest = Promise.resolve(featureRequest);
    await featuresRepository.save(feature);
    await service.deleteFeatureRequest(
      user.id,
      org.id,
      project.id,
      featureRequest.id,
    );
    const features = await featuresRepository.find({
      where: { featureRequest: { id: featureRequest.id } },
    });
    expect(features.length).toEqual(0);
  });
  describe('when adding a comment to a feature request', () => {
    it('should add a comment to the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      const comment = await service.createFeatureRequestComment(
        org.id,
        project.id,
        user.id,
        featureRequest.id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      expect(comment).toBeDefined();
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });
  describe('when adding a comment with mention to a feature request', () => {
    it('should add a comment to the feature request', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      const comment = await service.createFeatureRequestComment(
        org.id,
        project.id,
        user.id,
        featureRequest.id,
        {
          content: 'Test Comment',
          mentions: [user.id],
        },
      );
      expect(comment).toBeDefined();
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });
  describe('when updating a comment for a feature request', () => {
    it('should update the comment', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      const comment = await service.createFeatureRequestComment(
        org.id,
        project.id,
        user.id,
        featureRequest.id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updatedComment = await service.updateFeatureRequestComment(
        org.id,
        project.id,
        user.id,
        featureRequest.id,
        comment.id,
        {
          content: 'Updated Comment',
          mentions: [],
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
  describe('when updating a comment with mention for a feature request', () => {
    it('should update the comment', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      const comment = await service.createFeatureRequestComment(
        org.id,
        project.id,
        user.id,
        featureRequest.id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updatedComment = await service.updateFeatureRequestComment(
        org.id,
        project.id,
        user.id,
        featureRequest.id,
        comment.id,
        {
          content: 'Updated Comment',
          mentions: [user.id],
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
  describe('when deleting a comment for a feature request', () => {
    it('should delete the comment', async () => {
      const featureRequest = await service.addFeatureRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      const comment = await service.createFeatureRequestComment(
        org.id,
        project.id,
        user.id,
        featureRequest.id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      await service.deleteFeatureRequestComment(
        org.id,
        user.id,
        featureRequest.id,
        comment.id,
      );
      const result = await service.getFeatureRequestById(
        org.id,
        project.id,
        featureRequest.id,
      );
      expect(result.comments).toHaveLength(0);
    });
  });
  describe('when searching feature requests', () => {
    it('should return the feature requests', async () => {
      await service.addFeatureRequest(user.id, org.id, project.id, {
        title: 'My Feature Request',
        description: 'My Feature Request Description',
      });
      await service.addFeatureRequest(user.id, org.id, project.id, {
        title: 'My Other Feature Request',
        description: 'My Other Feature Request Description',
      });

      const featureRequests =
        await service.searchFeatureRequestsByTitleOrDescription(
          org.id,
          project.id,
          'my feature request',
          1,
          1,
        );
      expect(featureRequests).toHaveLength(1);
      expect(featureRequests[0].title).toEqual('My Feature Request');
      expect(featureRequests[0].description).toEqual(
        'My Feature Request Description',
      );
    });
  });
});
