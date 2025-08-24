import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from './objective.entity';
import { OrgsService } from '../orgs/orgs.service';
import { Org } from '../orgs/org.entity';
import { TokensService } from '../auth/tokens.service';
import { KeyResult } from './key-result.entity';
import { NotFoundException } from '@nestjs/common';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Timeline } from '../common/timeline.enum';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { OrgOkrsController } from './org-okrs.controller';
import { OrgOkrsService } from './org-okrs.service';

describe('OrgOkrsController', () => {
  let controller: OrgOkrsController;
  let orgsRepository: Repository<Org>;
  let orgsService: OrgsService;
  let usersService: UsersService;
  let org: Org;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Initiative])],
      [OrgOkrsService, OrgsService, TokensService, UsersService],
      [OrgOkrsController],
    );
    cleanup = dbCleanup;
    controller = module.get<OrgOkrsController>(OrgOkrsController);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    await orgsRepository.save(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when creating an OKR', () => {
    it('should return the created OKR', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
        },
      );
      expect(okr.objective.title).toEqual('My OKR');
    });
    it('should validate the OKR', async () => {
      await expect(
        controller.create(
          org.id,

          {
            user: {
              org: org.id,
            },
          },
          {
            objective: {
              title: '',
            },
          },
        ),
      ).rejects.toThrow();
    });
    it('should validate the timeline when it exists', async () => {
      await expect(
        controller.create(
          org.id,

          {
            user: {
              org: org.id,
            },
          },
          {
            objective: {
              title: 'My OKR',
              timeline: 'invalid',
            },
          },
        ),
      ).rejects.toThrow();
    });
    it('should store the timeline when it exists', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
            timeline: 'this-quarter',
          },
        },
      );
      expect(okr.objective.timeline).toEqual('this-quarter');
    });
  });

  describe('when listing OKRs', () => {
    it('should return an empty array', async () => {
      const okrs = await controller.list(org.id, {
        user: {
          org: org.id,
        },
      });
      expect(okrs).toEqual([]);
    });
    it('should return an array of OKRs', async () => {
      await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
        },
      );
      const okrs = await controller.list(org.id, {
        user: {
          org: org.id,
        },
      });
      expect(okrs.length).toEqual(1);
      expect(okrs[0].title).toEqual('My OKR');
      expect(okrs[0].status).toEqual('on-track');
      expect(okrs[0].createdAt).toBeDefined();
      expect(okrs[0].updatedAt).toBeDefined();
    });
  });

  describe('when getting an OKR', () => {
    it('should return the OKR', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
        },
      );
      const okr2 = await controller.get(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      expect(okr2.objective.title).toEqual('My OKR');
    });
  });

  describe('when deleting an OKR', () => {
    it('should delete the OKR', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
        },
      );
      await controller.delete(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      await expect(
        controller.get(org.id, okr.objective.id, {
          user: {
            org: org.id,
          },
        }),
      ).rejects.toThrow();
    });
    it('should delete the OKR and its key results', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [
            { title: 'My key result' },
            { title: 'My key result 2' },
            { title: 'My key result 3' },
          ],
        },
      );
      await controller.delete(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      await expect(
        controller.get(org.id, okr.objective.id, {
          user: {
            org: org.id,
          },
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('when creating an OKR with key results', () => {
    it('should return the created OKR with key results', async () => {
      const okr = await controller.create(
        org.id,
        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [
            { title: 'My key result' },
            { title: 'My key result 2' },
            { title: 'My key result 3' },
          ],
        },
      );
      expect(okr.keyResults.length).toEqual(3);
      expect(okr.keyResults[0].title).toEqual('My key result');
      expect(okr.keyResults[1].title).toEqual('My key result 2');
      expect(okr.keyResults[2].title).toEqual('My key result 3');
    });
  });

  describe('when updating Key Results Progress', () => {
    it('should update the Key Result Progress', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [
            { title: 'My key result' },
            { title: 'My key result 2' },
            { title: 'My key result 3' },
          ],
        },
      );
      await controller.patchKeyResult(
        org.id,

        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id,
          },
        },
        {
          progress: 0.5,
        },
      );
      const okr2 = await controller.get(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      expect(okr2.keyResults[0].progress).toEqual(0.5);
    });
    it('should not update the Key Result Progress if the Key Result does not belong to the OKR', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Test User',
        'testotheruser@example.com',
        'testtesttest',
      );
      const org2 = await orgsService.createForUser(otherUser);
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [
            { title: 'My key result' },
            { title: 'My key result 2' },
            { title: 'My key result 3' },
          ],
        },
      );
      await expect(
        controller.patchKeyResult(
          org.id,

          okr.objective.id,
          okr.keyResults[0].id,
          {
            user: {
              org: org2.id,
            },
          },
          {
            progress: 0.5,
          },
        ),
      ).rejects.toThrow();
    });
    it('should update the Objective Progress', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [
            { title: 'My key result' },
            { title: 'My key result 2' },
            { title: 'My key result 3' },
          ],
        },
      );
      await controller.patchKeyResult(
        org.id,

        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id,
          },
        },
        {
          progress: 0.5,
        },
      );
      const okr2 = await controller.get(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      expect(okr2.objective.progress).toEqual(0.17);
    });
    it('should update the key result status', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [
            { title: 'My key result' },
            { title: 'My key result 2' },
            { title: 'My key result 3' },
          ],
        },
      );
      await controller.patchKeyResult(
        org.id,

        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id,
          },
        },
        {
          status: 'off-track',
        },
      );
      const okr2 = await controller.get(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      expect(okr2.keyResults[0].status).toEqual('off-track');
    });
  });

  describe('when getting the key results list', () => {
    it('should return the key results list', async () => {
      await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [
            { title: 'My key result' },
            { title: 'My key result 2' },
            { title: 'My key result 3' },
          ],
        },
      );
      const keyResults = await controller.listKeyResults(
        {
          user: {
            org: org.id,
          },
        },
        org.id,
      );
      expect(keyResults.length).toEqual(3);
      // check that the items are in the list regardless of the order
      expect(
        keyResults.map((kr) => kr.title).sort((a, b) => a.localeCompare(b)),
      ).toEqual(['My key result', 'My key result 2', 'My key result 3']);
    });
  });
  describe('when deleting a key result', () => {
    it('should delete the key result', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [{ title: 'My key result' }],
        },
      );
      await controller.deleteKeyResult(
        org.id,

        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id,
          },
        },
      );
      const okr2 = await controller.get(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      expect(okr2.keyResults.length).toEqual(0);
    });
  });
  describe('when updating a key result', () => {
    it('should update the key result', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [{ title: 'My key result' }],
        },
      );
      await controller.updateKeyResult(
        org.id,

        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id,
          },
        },
        {
          title: 'My key result 2',
          progress: 0.5,
          status: 'off-track',
        },
      );
      const okr2 = await controller.get(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      expect(okr2.keyResults[0].title).toEqual('My key result 2');
    });
  });
  describe('when creating a key result', () => {
    it('should create the key result', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
        },
      );
      await controller.createKeyResult(
        okr.objective.id,
        {
          user: {
            org: org.id,
          },
        },
        {
          title: 'My key result',
          progress: 0.5,
          status: 'off-track',
        },
      );
      const okr2 = await controller.get(org.id, okr.objective.id, {
        user: {
          org: org.id,
        },
      });
      expect(okr2.keyResults.length).toEqual(1);
      expect(okr2.keyResults[0].title).toEqual('My key result');
    });
  });
  describe('When getting a key result', () => {
    it('should return the key result', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
          },
          keyResults: [{ title: 'My key result' }],
        },
      );
      const keyResult = await controller.getKeyResult(
        org.id,

        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id,
          },
        },
      );
      expect(keyResult.title).toEqual('My key result');
    });
  });
  describe('when listing the okrs for a timeline', () => {
    it('should return the okrs for the timeline', async () => {
      await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'My OKR',
            timeline: Timeline.THIS_QUARTER,
          },
        },
      );
      const okrs = await controller.listForTimeline(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        Timeline.THIS_QUARTER,
      );
      expect(okrs.length).toEqual(1);
      expect(okrs[0].title).toEqual('My OKR');
    });
  });
  describe('when adding a comment to a key result', () => {
    it('should add a comment to the key result', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'Test Objective',
          },
          keyResults: [
            {
              title: 'Test Key Result',
              progress: 0,
              status: 'on-track',
            },
          ],
        },
      );
      const comment = await controller.addCommentToKeyResult(
        org.id,

        okr.keyResults[0].id,
        {
          user: {
            org: org.id,
            sub: user.id,
          },
        },
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
  describe('when updating a comment for a key result', () => {
    it('should update the comment', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'Test Objective',
          },
          keyResults: [
            {
              title: 'Test Key Result',
              progress: 0,
              status: 'on-track',
            },
          ],
        },
      );
      const comment = await controller.addCommentToKeyResult(
        org.id,

        okr.keyResults[0].id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updatedComment = await controller.updateKeyResultComment(
        org.id,

        comment.id,
        {
          user: {
            org: org.id,
            sub: user.id,
          },
        },
        {
          content: 'Updated Comment',
          mentions: [user.id],
        },
      );
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
  describe('when deleting a comment for a key result', () => {
    it('should delete the comment', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'Test Objective',
          },
          keyResults: [
            {
              title: 'Test Key Result',
              progress: 0,
              status: 'on-track',
            },
          ],
        },
      );
      const comment = await controller.addCommentToKeyResult(
        org.id,

        okr.keyResults[0].id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      await expect(
        controller.deleteKeyResultComment(org.id, comment.id, {
          user: {
            org: org.id,
            sub: user.id,
          },
        }),
      ).resolves.not.toThrow();
    });
  });
  describe('when adding a comment to an objective', () => {
    it('should add a comment to the objective', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'Test Objective',
          },
          keyResults: [
            {
              title: 'Test Key Result',
              progress: 0,
              status: 'on-track',
            },
          ],
        },
      );
      const comment = await controller.addCommentToObjective(
        org.id,

        okr.objective.id,
        {
          user: {
            org: org.id,
            sub: user.id,
          },
        },
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
  describe('when updating a comment for an objective', () => {
    it('should update the comment', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'Test Objective',
          },
          keyResults: [
            {
              title: 'Test Key Result',
              progress: 0,
              status: 'on-track',
            },
          ],
        },
      );
      const comment = await controller.addCommentToObjective(
        org.id,

        okr.objective.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      const updatedComment = await controller.updateObjectiveComment(
        org.id,

        comment.id,
        {
          user: {
            org: org.id,
            sub: user.id,
          },
        },
        {
          content: 'Updated Comment',
          mentions: [],
        },
      );
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
  describe('when deleting a comment for an objective', () => {
    it('should delete the comment', async () => {
      const okr = await controller.create(
        org.id,

        {
          user: {
            org: org.id,
          },
        },
        {
          objective: {
            title: 'Test Objective',
          },
          keyResults: [
            {
              title: 'Test Key Result',
              progress: 0,
              status: 'on-track',
            },
          ],
        },
      );
      const comment = await controller.addCommentToObjective(
        org.id,

        okr.objective.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          content: 'Test Comment',
          mentions: [],
        },
      );
      await expect(
        controller.deleteObjectiveComment(org.id, comment.id, {
          user: {
            org: org.id,
            sub: user.id,
          },
        }),
      ).resolves.not.toThrow();
    });
  });
  describe('when getting the okr stats', () => {
    it('should return the okr stats', async () => {
      const stats = await controller.getOkrStats(
        org.id,
        Timeline.THIS_QUARTER,
        {
          user: {
            org: org.id,
          },
        },
      );
      expect(stats).toEqual({
        keyResults: {
          completed: 0,
          inProgress: 0,
          total: 0,
        },
        objectives: {
          completed: 0,
          inProgress: 0,
          total: 0,
        },
        progress: {
          current: 0,
        },
      });
    });
  });
});
