import { RequestsService } from './requests.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { RequestVoteService } from './request-votes.service';
import { RequestVote } from './request-vote.entity';
import { uuid } from 'uuidv4';
import { RequestComment } from './request-comment.entity';
import { Project } from '../projects/project.entity';

describe('RequestVoteService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: RequestVoteService;
  let requestsService: RequestsService;
  let orgsRepository: Repository<Org>;
  let requestVotesRepository: Repository<RequestVote>;
  let projectsRepository: Repository<Project>;
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
          Request,
          RequestVote,
          RequestComment,
          Project,
        ]),
      ],
      [RequestsService, RequestVoteService, UsersService, OrgsService],
    );
    cleanup = dbCleanup;
    requestsService = module.get<RequestsService>(RequestsService);
    service = module.get<RequestVoteService>(RequestVoteService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    requestVotesRepository = module.get<Repository<RequestVote>>(
      getRepositoryToken(RequestVote),
    );
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
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

  describe('when upvoting a request', () => {
    it('should upvote the request', async () => {
      const request = await requestsService.addRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Request',
          description: 'Test Description',
        },
      );
      await service.upvoteRequest(user.id, org.id, project.id, request.id);
      const requestVote = await requestVotesRepository.findOneByOrFail({
        user: { id: user.id },
        request: { id: request.id },
      });
      expect(requestVote.vote).toEqual(1);
    });
    it('should throw an error if the request does not exist', async () => {
      await expect(
        service.upvoteRequest(user.id, org.id, project.id, uuid()),
      ).rejects.toThrow();
    });
    it('should throw an error if the request does not belong to the org', async () => {
      const request = await requestsService.addRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Request',
          description: 'Test Description',
        },
      );

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.upvoteRequest(user.id, otherOrg.id, uuid(), request.id),
      ).rejects.toThrow();
    });
    it('should increment the votes count', async () => {
      const request = await requestsService.addRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Request',
          description: 'Test Description',
        },
      );
      await service.upvoteRequest(user.id, org.id, project.id, request.id);
      const requestVote = await requestVotesRepository.findOneByOrFail({
        user: { id: user.id },
        request: { id: request.id },
      });
      expect(requestVote.vote).toEqual(1);
      expect(request.votesCount).toEqual(1);
    });
  });
  describe('when downvoting a request', () => {
    it('should downvote the request', async () => {
      const request = await requestsService.addRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Request',
          description: 'Test Description',
        },
      );
      await service.downvoteRequest(user.id, org.id, project.id, request.id);
      const requestVote = await requestVotesRepository.findOneByOrFail({
        user: { id: user.id },
        request: { id: request.id },
      });
      expect(requestVote.vote).toEqual(-1);

      const updatedRequest = await requestsService.getRequestById(
        org.id,
        project.id,
        request.id,
      );
      expect(updatedRequest.votesCount).toEqual(0);
    });
    it('should throw an error if the request does not exist', async () => {
      await expect(
        service.downvoteRequest(user.id, org.id, project.id, uuid()),
      ).rejects.toThrow();
    });
    it('should throw an error if the request does not belong to the org', async () => {
      const request = await requestsService.addRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Request',
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
        service.downvoteRequest(
          user.id,
          otherOrg.id,
          otherOrgProject.id,
          request.id,
        ),
      ).rejects.toThrow();
    });
  });
  describe('when getting my votes', () => {
    it('should return my votes', async () => {
      const request = await requestsService.addRequest(
        user.id,
        org.id,
        project.id,
        {
          title: 'Test Request',
          description: 'Test Description',
        },
      );

      await service.upvoteRequest(user.id, org.id, project.id, request.id);
      await service.downvoteRequest(user.id, org.id, project.id, request.id);

      const votes = await service.getVotes(user.id, org.id, project.id);

      expect(votes.length).toEqual(1);
      expect(votes[0].vote).toEqual(-1);
    });
    it('should return an empty array if there are no votes', async () => {
      const votes = await service.getVotes(user.id, org.id, project.id);

      expect(votes.length).toEqual(0);
    });
  });
});
