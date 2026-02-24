import { RequestsController } from './requests.controller';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { RequestsService } from './requests.service';
import { Request } from './request.entity';
import { RequestVoteService } from './request-votes.service';
import { RequestVote } from './request-vote.entity';
import { RequestComment } from './request-comment.entity';
import { Project } from '../projects/project.entity';
import { RequestStatus } from './request-status.enum';

describe('RequestsController', () => {
  let controller: RequestsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;
  let orgsRepository: Repository<Org>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
          Request,
          RequestVote,
          RequestComment,
        ]),
        UsersModule,
      ],
      [RequestsService, RequestVoteService],
      [RequestsController],
    );
    cleanup = dbCleanup;
    controller = module.get<RequestsController>(RequestsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));

    await orgsRepository.save(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when adding a new feature request', () => {
    it('should return the newly created feature request', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const result = await controller.addRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      expect(result.title).toBe(createRequestDto.title);
      expect(result.description).toBe(createRequestDto.description);
    });
  });
  describe('when listing feature requests', () => {
    it('should return a list of feature requests', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      await controller.addRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const result = await controller.listRequests(org.id, project.id);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe(createRequestDto.title);
      expect(result[0].description).toBe(createRequestDto.description);
    });
  });
  describe('when getting a feature request by id', () => {
    it('should return the feature request', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const result = await controller.getRequestById(org.id, project.id, id);
      expect(result.title).toBe(createRequestDto.title);
      expect(result.description).toBe(createRequestDto.description);
    });
  });
  it('should throw an error if the org does not exist', async () => {
    await expect(
      controller.getRequestById(org.id, project.id, 'non-existent-id'),
    ).rejects.toThrow();
  });
  describe('when updating a feature request', () => {
    it('should return the updated feature request', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const updateRequestDto = {
        title: 'Updated Feature Request',
        description: 'This is an updated feature request',
        status: RequestStatus.IN_PROGRESS,
        estimation: null,
      };
      const result = await controller.updateRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        id,
        updateRequestDto,
      );
      expect(result.title).toBe(updateRequestDto.title);
      expect(result.description).toBe(updateRequestDto.description);
    });
  });
  describe('when deleting a feature request', () => {
    it('should delete the feature request', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      await controller.deleteRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        id,
      );
      await expect(
        controller.getRequestById(org.id, project.id, id),
      ).rejects.toThrow();
    });
  });
  describe('when upvoting a feature request', () => {
    it('should upvote the feature request', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      await controller.upvoteRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        id,
      );
      const request = await controller.getRequestById(org.id, project.id, id);
      expect(request.votesCount).toEqual(1);
    });
  });
  describe('when downvoting a feature request', () => {
    it('should downvote the feature request', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      await controller.downvoteRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        id,
      );
      const request = await controller.getRequestById(org.id, project.id, id);
      expect(request.votesCount).toEqual(0);
    });
  });
  describe('when adding a comment', () => {
    it('should add a comment', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const comment = await controller.addRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      expect(comment).toBeDefined();
      expect(comment.createdBy.id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });
  describe('when adding a comment with mentions', () => {
    it('should add a comment', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const comment = await controller.addRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        id,
        {
          content: 'Test Comment',
          mentions: [user.id],
        },
      );
      expect(comment).toBeDefined();
      expect(comment.createdBy.id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });
  describe('when deleting a comment', () => {
    it('should delete the comment', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const comment = await controller.addRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      await controller.deleteRequestComment(
        org.id,
        {
          user: {
            sub: user.id,
          },
        },
        id,
        comment.id,
      );
      const requestDto = await controller.getRequestById(
        org.id,
        project.id,
        id,
      );
      expect(requestDto.comments).toBeDefined();
      expect(requestDto.comments.length).toEqual(0);
    });
  });
  describe('when updating a comment', () => {
    it('should update the comment', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const comment = await controller.addRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updateCommentDto = {
        content: 'Updated Comment',
        mentions: [],
      };
      const updatedComment = await controller.updateRequestComment(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
          },
        },
        id,
        comment.id,
        updateCommentDto,
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
  describe('when updating a comment with mention', () => {
    it('should update the comment', async () => {
      const createRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        createRequestDto,
      );
      const comment = await controller.addRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        id,
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updateCommentDto = {
        content: 'Updated Comment',
        mentions: [user.id],
      };
      const updatedComment = await controller.updateRequestComment(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
          },
        },
        id,
        comment.id,
        updateCommentDto,
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
  describe('when searching feature requests', () => {
    it('should return the feature requests', async () => {
      await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        {
          title: 'My Feature Request',
          description: 'My Feature Request Description',
        },
      );
      await controller.addRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        project.id,
        {
          title: 'My Other Feature Request',
          description: 'My Other Feature Request Description',
        },
      );

      const requests = await controller.search(
        org.id,
        project.id,
        'my feature request',
      );
      expect(requests).toHaveLength(1);
      expect(requests[0].title).toEqual('My Feature Request');
      expect(requests[0].description).toEqual('My Feature Request Description');
    });
  });
});
