import { InitiativesController } from './initiatives.controller';
import { OrgsService } from '../../orgs/orgs.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { OkrsService } from '../../okrs/okrs.service';
import { TokensService } from '../../auth/tokens.service';
import { Initiative } from './initiative.entity';
import { Objective } from '../../okrs/objective.entity';
import { Priority } from '../../common/priority.enum';
import { InitiativesService } from './initiatives.service';
import { UsersService } from '../../users/users.service';
import { UsersModule } from '../../users/users.module';
import { MilestonesService } from '../milestones/milestones.service';
import { Milestone } from '../milestones/milestone.entity';
import { BacklogModule } from '../../backlog/backlog.module';
import { InitiativeStatus } from './initiativestatus.enum';
import { Sprint } from '../../sprints/sprint.entity';
import { File } from '../../files/file.entity';
import { InitiativeFile } from './initiative-file.entity';
import { User } from '../../users/user.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { InitiativeComment } from './initiative-comment.entity';
import { Repository } from 'typeorm';
import { PaymentPlan } from '../../auth/payment.plan';
import { FeatureRequest } from '../../feature-requests/feature-request.entity';
import { FeatureRequestComment } from '../../feature-requests/feature-request-comment.entity';
import { FeatureRequestVote } from '../../feature-requests/feature-request-vote.entity';
import { Project } from '../../projects/project.entity';

describe('InitiativesController', () => {
  let controller: InitiativesController;
  let milestoneService: MilestonesService;
  let orgsRepository: Repository<Org>;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let secondUser: User;
  let project: Project;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          Objective,
          KeyResult,
          Initiative,
          Milestone,
          Sprint,
          File,
          InitiativeFile,
          WorkItem,
          WorkItemFile,
          InitiativeComment,
          FeatureRequest,
          FeatureRequestComment,
          FeatureRequestVote,
          Project,
        ]),
        UsersModule,
        BacklogModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        InitiativesService,
        MilestonesService,
        FilesService,
        FilesStorageRepository,
      ],
      [InitiativesController],
    );
    cleanup = dbCleanup;
    controller = module.get<InitiativesController>(InitiativesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    milestoneService = module.get<MilestonesService>(MilestonesService);
    orgsRepository = module.get(getRepositoryToken(Org));

    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    secondUser = await usersService.createUserWithOrg(
      'Second User',
      'test2@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    org.users = Promise.resolve([user, secondUser]);
    await orgsRepository.save(org);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when creating a initiative', () => {
    it('should return 201', async () => {
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.CLOSED,
        },
      );
      expect(initiativeResponse.title).toEqual('my initiative');
      expect(initiativeResponse.description).toEqual(
        'my initiative description',
      );
      expect(initiativeResponse.priority).toEqual(Priority.HIGH);
      expect(initiativeResponse.status).toEqual(InitiativeStatus.CLOSED);
      expect(initiativeResponse.createdAt).toBeDefined();
    });
    it('should return 400 if title is missing', async () => {
      try {
        await controller.create(
          org.id,
          project.id,
          {
            user: {
              sub: user.id,
              org: org.id,
            },
          },
          {
            title: null,
            description: 'my initiative description',
            priority: Priority.HIGH,
            status: InitiativeStatus.PLANNED,
          },
        );
      } catch (e) {
        expect(e.message).toEqual('Bad Request');
      }
    });
  });
  describe('when getting initiatives', () => {
    it('should return 200', async () => {
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiatives = await controller.list(org.id, project.id, {
        user: {
          org: org.id,
        },
      });
      expect(initiatives[0].title).toEqual('my initiative');
      expect(initiatives[0].priority).toEqual(Priority.HIGH);
      expect(initiatives[0].progress).toEqual(0);
      expect(initiatives[0].workItemsCount).toEqual(0);
      expect(initiatives[0].createdAt).toBeDefined();
      expect(initiatives[0].updatedAt).toBeDefined();
    });
    it('should return initiatives paginated', async () => {
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative 2',
          description: 'my initiative description 2',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiatives = await controller.list(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        1,
        1,
      );
      expect(initiatives.length).toEqual(1);
    });
  });
  describe('when getting initiatives without milestone', () => {
    it('should return 200', async () => {
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiatives = await controller.listWithoutMilestone(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
      );
      expect(initiatives[0].title).toEqual('my initiative');
      expect(initiatives[0].priority).toEqual(Priority.HIGH);
      expect(initiatives[0].createdAt).toBeDefined();
      expect(initiatives[0].updatedAt).toBeDefined();
    });
  });
  describe('when getting a initiative', () => {
    it('should return 200', async () => {
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiative = await controller.get(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
      );
      expect(initiative.title).toEqual('my initiative');
      expect(initiative.priority).toEqual(Priority.HIGH);
      expect(initiative.createdAt).toBeDefined();
      expect(initiative.updatedAt).toBeDefined();
    });
  });
  describe('when updating a initiative', () => {
    it('should return 200', async () => {
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiative = await controller.update(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          mentions: [user.id],
          priority: Priority.HIGH,
          status: InitiativeStatus.CLOSED,
        },
      );
      expect(initiative.title).toEqual('my initiative');
      expect(initiative.priority).toEqual(Priority.HIGH);
      expect(initiative.status).toEqual(InitiativeStatus.CLOSED);
      expect(initiative.createdAt).toBeDefined();
      expect(initiative.updatedAt).toBeDefined();
    });
  });
  describe('when deleting a initiative', () => {
    it('should return 200', async () => {
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await controller.delete(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
      );
    });
  });
  describe('when patching the initiative', () => {
    it('should update the status', async () => {
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiative = await controller.patch(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          status: InitiativeStatus.CLOSED,
        },
      );
      expect(initiative.title).toEqual('my initiative');
      expect(initiative.priority).toEqual(Priority.HIGH);
      expect(initiative.status).toEqual(InitiativeStatus.CLOSED);
      expect(initiative.createdAt).toBeDefined();
      expect(initiative.updatedAt).toBeDefined();
    });
    it('should update the priority', async () => {
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiative = await controller.patch(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          priority: Priority.LOW,
        },
      );
      expect(initiative.title).toEqual('my initiative');
      expect(initiative.priority).toEqual(Priority.LOW);
      expect(initiative.status).toEqual(InitiativeStatus.PLANNED);
      expect(initiative.createdAt).toBeDefined();
      expect(initiative.updatedAt).toBeDefined();
    });
    it('should update the milestone', async () => {
      const milestone = await milestoneService.createMilestone(
        org.id,
        project.id,
        {
          title: 'my milestone',
          description: 'my milestone description',
          dueDate: '2020-01-01',
        },
      );
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiative = await controller.patch(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          milestone: milestone.id,
        },
      );
      expect(initiative.title).toEqual('my initiative');
      expect(initiative.priority).toEqual(Priority.HIGH);
      expect(initiative.status).toEqual(InitiativeStatus.PLANNED);
      expect(initiative.milestone.id).toEqual(milestone.id);
      expect(initiative.createdAt).toBeDefined();
      expect(initiative.updatedAt).toBeDefined();
    });
  });
  describe('when searching initiatives', () => {
    it('should return 200', async () => {
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const initiatives = await controller.search(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        'my initiative',
      );
      expect(initiatives[0].title).toEqual('my initiative');
      expect(initiatives[0].priority).toEqual(Priority.HIGH);
      expect(initiatives[0].createdAt).toBeDefined();
      expect(initiatives[0].updatedAt).toBeDefined();
    });
  });
  describe('when listing initiative comments', () => {
    it('should return the list of comments', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          content: 'my comment',
          mentions: [],
        },
      );
      const comments = await controller.listComments(initiativeResponse.id);
      expect(comments[0].content).toEqual('my comment');
      expect(comments[0].createdAt).toBeDefined();
    });
  });
  describe('when adding a comment to a initiative', () => {
    it('should return the newly added comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const comment = await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          content: 'my comment',
          mentions: [user.id],
        },
      );
      expect(comment.content).toEqual('my comment');
      expect(comment.createdAt).toBeDefined();
    });
  });
  describe('when deleting a comment from a initiative', () => {
    it('should delete it successfully', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const comment = await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          content: 'my comment',
          mentions: [],
        },
      );
      await controller.deleteComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        initiativeResponse.id,
        comment.id,
      );
    });
  });
  describe('when updating a comment from a initiative', () => {
    it('should return the updated comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      const comment = await controller.addComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        initiativeResponse.id,
        {
          content: 'my comment',
          mentions: [],
        },
      );
      const updatedComment = await controller.updateComment(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        initiativeResponse.id,
        comment.id,
        {
          content: 'my updated comment',
          mentions: [user.id],
        },
      );
      expect(updatedComment.content).toEqual('my updated comment');
      expect(updatedComment.createdAt).toBeDefined();
    });
  });
  describe('when changing the assigned user of a initiative', () => {
    it('should update the assigned user', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const initiativeResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
        },
      );
      await controller.changeAssignee(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        org.id,
        project.id,
        initiativeResponse.id,
        {
          assignee: secondUser.id,
        },
      );
      const updatedInitiative = await controller.get(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
      );
      expect(updatedInitiative.assignedTo.id).toEqual(secondUser.id);
      await controller.changeAssignee(
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        org.id,
        project.id,
        initiativeResponse.id,
        {
          assignee: '',
        },
      );
      const updatedInitiativeWithNoAssignee = await controller.get(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        initiativeResponse.id,
      );
      expect(updatedInitiativeWithNoAssignee.assignedTo).toBeUndefined();
    });
  });
});
