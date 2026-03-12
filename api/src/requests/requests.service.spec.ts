import { RequestsService } from './requests.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { RequestStatus } from './request-status.enum';
import { uuid } from 'uuidv4';
import { RequestVote } from './request-vote.entity';
import { RequestComment } from './request-comment.entity';
import { Project } from '../projects/project.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';

describe('RequestsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: RequestsService;
  let orgsRepository: Repository<Org>;
  let projectsRepository: Repository<Project>;
  let featuresRepository: Repository<Initiative>;
  let requestsRepository: Repository<Request>;
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
          Request,
          RequestVote,
          RequestComment,
          Project,
        ]),
      ],
      [RequestsService, UsersService, OrgsService],
    );
    cleanup = dbCleanup;
    service = module.get<RequestsService>(RequestsService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    featuresRepository = module.get<Repository<Initiative>>(
      getRepositoryToken(Initiative),
    );
    requestsRepository = module.get<Repository<Request>>(
      getRepositoryToken(Request),
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
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.title).toEqual('Test Feature Request');
      expect(request.description).toEqual('Test Description');
      expect(request.status).toEqual(RequestStatus.PENDING);
      expect(request.estimation).toBeNull();
      expect(request.completedAt).toBeNull();
      expect(request.org).toBeDefined();
      expect(request.createdBy).toBeDefined();
    });
  });

  describe('when listing feature requests', () => {
    it('should return all feature requests for the org', async () => {
      await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 1',
        description: 'Test Description 1',
      });
      await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 2',
        description: 'Test Description 2',
      });

      const requests = await service.listRequests(org.id, project.id);
      expect(requests).toHaveLength(2);
      expect(requests[0].title).toEqual('Test Feature Request 2');
      expect(requests[1].title).toEqual('Test Feature Request 1');
    });
    it('should return an empty array if there are no feature requests', async () => {
      const requests = await service.listRequests(org.id, project.id);
      expect(requests).toHaveLength(0);
    });
    it('should return the feature requests in pages', async () => {
      await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 1',
        description: 'Test Description 1',
      });
      await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request 2',
        description: 'Test Description 2',
      });

      const requests = await service.listRequests(org.id, project.id, 1, 1);
      expect(requests).toHaveLength(1);
      expect(requests[0].title).toEqual('Test Feature Request 2');
    });
  });

  describe('when getting a feature request by id', () => {
    it('should return the feature request', async () => {
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const foundRequest = await service.getRequestById(
        org.id,
        project.id,
        request.id,
      );
      expect(foundRequest).toBeDefined();
      expect(foundRequest.id).toEqual(request.id);
      expect(foundRequest.title).toEqual('Test Feature Request');
      expect(foundRequest.description).toEqual('Test Description');
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.getRequestById(org.id, project.id, uuid()),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);
      const otherOrgProject = new Project();
      otherOrgProject.name = 'Test Project';
      otherOrgProject.org = Promise.resolve(otherOrg);
      await projectsRepository.save(otherOrgProject);

      await expect(
        service.getRequestById(otherOrg.id, otherOrgProject.id, request.id),
      ).rejects.toThrow();
    });
  });

  describe('when updating a feature request', () => {
    it('should update the feature request', async () => {
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const updatedRequest = await service.updateRequest(
        user.id,
        org.id,
        project.id,
        request.id,
        {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: RequestStatus.IN_PROGRESS,
          estimation: 5,
        },
      );

      expect(updatedRequest).toBeDefined();
      expect(updatedRequest.id).toEqual(request.id);
      expect(updatedRequest.title).toEqual('Updated Feature Request');
      expect(updatedRequest.description).toEqual('Updated Description');
      expect(updatedRequest.status).toEqual(RequestStatus.IN_PROGRESS);
      expect(updatedRequest.estimation).toEqual(5);
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.updateRequest(user.id, org.id, project.id, uuid(), {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: RequestStatus.IN_PROGRESS,
          estimation: 5,
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);
      const otherOrgProject = new Project();
      otherOrgProject.name = 'Test Project';
      otherOrgProject.org = Promise.resolve(otherOrg);
      await projectsRepository.save(otherOrgProject);

      await expect(
        service.updateRequest(
          user.id,
          otherOrg.id,
          otherOrgProject.id,
          request.id,
          {
            title: 'Updated Feature Request',
            description: 'Updated Description',
            status: RequestStatus.IN_PROGRESS,
            estimation: 5,
          },
        ),
      ).rejects.toThrow();
    });
    it('should throw an error if the user does not belong to the org', async () => {
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otheruser@exmaple.com',
        'testtesttest',
      );

      await expect(
        service.updateRequest(otherUser.id, org.id, project.id, request.id, {
          title: 'Updated Feature Request',
          description: 'Updated Description',
          status: RequestStatus.IN_PROGRESS,
          estimation: 5,
        }),
      ).rejects.toThrow();
    });
  });
  describe('when deleting a feature request', () => {
    it('should delete the feature request', async () => {
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });

      await service.deleteRequest(user.id, org.id, project.id, request.id);

      await expect(
        service.getRequestById(org.id, project.id, request.id),
      ).rejects.toThrow();
    });
  });
  it('should throw an error if the feature request does not exist', async () => {
    await expect(
      service.deleteRequest(user.id, org.id, project.id, uuid()),
    ).rejects.toThrow();
  });
  it('should throw an error if the feature request does not belong to the org', async () => {
    const request = await service.addRequest(user.id, org.id, project.id, {
      title: 'Test Feature Request',
      description: 'Test Description',
    });

    const otherOrg = await orgsService.createForUser(user);
    await orgsRepository.save(otherOrg);
    const otherOrgProject = new Project();
    otherOrgProject.name = 'Test Project';
    otherOrgProject.org = Promise.resolve(otherOrg);
    await projectsRepository.save(otherOrgProject);

    await expect(
      service.deleteRequest(
        user.id,
        otherOrg.id,
        otherOrgProject.id,
        request.id,
      ),
    ).rejects.toThrow();
  });
  it('should remove the feature request from the initiatives', async () => {
    const requestEntity = new Request();
    requestEntity.title = 'Test Request';
    requestEntity.description = 'Test Description';
    requestEntity.org = Promise.resolve(org);
    requestEntity.project = Promise.resolve(project);
    requestEntity.createdBy = Promise.resolve(user);
    await requestsRepository.save(requestEntity);
    const feature = new Initiative();
    feature.title = 'Test Feature';
    feature.description = 'Test Description';
    feature.org = Promise.resolve(org);
    feature.createdBy = Promise.resolve(user);
    feature.project = Promise.resolve(project);
    feature.request = Promise.resolve(requestEntity);
    await featuresRepository.save(feature);
    await service.deleteRequest(user.id, org.id, project.id, requestEntity.id);
    const features = await featuresRepository.find({
      where: { request: { id: requestEntity.id } },
    });
    expect(features.length).toEqual(0);
  });
  describe('when adding a comment to a feature request', () => {
    it('should add a comment to the feature request', async () => {
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });
      const comment = await service.createRequestComment(
        org.id,
        project.id,
        user.id,
        request.id,
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
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });
      const comment = await service.createRequestComment(
        org.id,
        project.id,
        user.id,
        request.id,
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
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });
      const comment = await service.createRequestComment(
        org.id,
        project.id,
        user.id,
        request.id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updatedComment = await service.updateRequestComment(
        org.id,
        project.id,
        user.id,
        request.id,
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
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });
      const comment = await service.createRequestComment(
        org.id,
        project.id,
        user.id,
        request.id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updatedComment = await service.updateRequestComment(
        org.id,
        project.id,
        user.id,
        request.id,
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
      const request = await service.addRequest(user.id, org.id, project.id, {
        title: 'Test Feature Request',
        description: 'Test Description',
      });
      const comment = await service.createRequestComment(
        org.id,
        project.id,
        user.id,
        request.id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      await service.deleteRequestComment(
        org.id,
        user.id,
        request.id,
        comment.id,
      );
      const result = await service.getRequestById(
        org.id,
        project.id,
        request.id,
      );
      expect(result.comments).toHaveLength(0);
    });
  });
  describe('when searching feature requests', () => {
    it('should return the feature requests', async () => {
      await service.addRequest(user.id, org.id, project.id, {
        title: 'My Feature Request',
        description: 'My Feature Request Description',
      });
      await service.addRequest(user.id, org.id, project.id, {
        title: 'My Other Feature Request',
        description: 'My Other Feature Request Description',
      });

      const requests = await service.searchRequestsByTitleOrDescription(
        org.id,
        project.id,
        'my feature request',
        1,
        1,
      );
      expect(requests).toHaveLength(1);
      expect(requests[0].title).toEqual('My Feature Request');
      expect(requests[0].description).toEqual('My Feature Request Description');
    });
  });
});
