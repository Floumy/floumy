import { MilestonesService } from './milestones.service';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { User } from '../../users/user.entity';
import { Milestone } from './milestone.entity';
import { InitiativesService } from '../initiatives/initiatives.service';
import { Initiative } from '../initiatives/initiative.entity';
import { Priority } from '../../common/priority.enum';
import { OkrsService } from '../../okrs/okrs.service';
import { BacklogModule } from '../../backlog/backlog.module';
import { InitiativeStatus } from '../initiatives/initiativestatus.enum';
import { File } from '../../files/file.entity';
import { InitiativeFile } from '../initiatives/initiative-file.entity';
import { FilesModule } from '../../files/files.module';
import { Timeline } from '../../common/timeline.enum';
import { TimelineService } from '../../common/timeline.service';
import { Project } from '../../projects/project.entity';

describe('MilestonesService', () => {
  let usersService: UsersService;
  let service: MilestonesService;
  let orgsService: OrgsService;
  let initiativesService: InitiativesService;
  let user: User;
  let org: Org;
  let project: Project;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Milestone,
          Initiative,
          User,
          Objective,
          KeyResult,
          File,
          InitiativeFile,
        ]),
        BacklogModule,
        FilesModule,
      ],
      [
        OrgsService,
        MilestonesService,
        UsersService,
        InitiativesService,
        OkrsService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<MilestonesService>(MilestonesService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    initiativesService = module.get<InitiativesService>(InitiativesService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when creating a milestone', () => {
    it('should return a milestone', async () => {
      const milestone = await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      expect(milestone.id).toBeDefined();
      expect(milestone.title).toEqual('my milestone');
      expect(milestone.description).toEqual('my milestone');
      expect(milestone.dueDate).toEqual('2020-01-01');
    });
    it('should throw an error if title is missing', async () => {
      await expect(
        service.createMilestone(org.id, project.id, {
          title: '',
          description: 'my milestone',
          dueDate: '2020-01-01',
        }),
      ).rejects.toThrow('Milestone title is required');
    });
    it('should throw an error if dueDate is missing', async () => {
      await expect(
        service.createMilestone(org.id, project.id, {
          title: 'my milestone',
          description: 'my milestone',
          dueDate: '',
        }),
      ).rejects.toThrow('Milestone due date is required');
    });
    it('should throw an error if dueDate is invalid', async () => {
      await expect(
        service.createMilestone(org.id, project.id, {
          title: 'my milestone',
          description: 'my milestone',
          dueDate: '2020-01',
        }),
      ).rejects.toThrow('Invalid due date');
    });
  });
  describe('when listing milestones', () => {
    it('should return the milestones', async () => {
      await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      const milestones = await service.listMilestones(org.id, project.id);
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual('my milestone');
      expect(milestones[0].dueDate).toEqual('2020-01-01');
    });
  });
  describe('when listing milestones with initiatives', () => {
    it('should return the milestones', async () => {
      await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      const milestones = await service.listMilestonesWithInitiatives(
        org.id,
        project.id,
      );
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual('my milestone');
      expect(milestones[0].dueDate).toEqual('2020-01-01');
      expect(milestones[0].initiatives.length).toEqual(0);
      expect(milestones[0].timeline).toEqual('past');
    });
    it('should return the milestones with initiatives', async () => {
      const milestone = await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      await service.createMilestone(org.id, project.id, {
        title: 'my milestone 2',
        description: 'my milestone 2',
        dueDate: '2020-01-01',
      });
      await initiativesService.createInitiative(org.id, project.id, user.id, {
        title: 'my initiative',
        description: 'my initiative description',
        priority: Priority.HIGH,
        milestone: milestone.id,
        status: InitiativeStatus.PLANNED,
      });
      const milestones = await service.listMilestonesWithInitiatives(
        org.id,
        project.id,
      );
      expect(milestones.length).toEqual(2);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual('my milestone');
      expect(milestones[0].dueDate).toEqual('2020-01-01');
      expect(milestones[0].initiatives.length).toEqual(1);
      expect(milestones[0].initiatives[0].id).toBeDefined();
      expect(milestones[0].initiatives[0].title).toEqual('my initiative');
      expect(milestones[0].initiatives[0].priority).toEqual(
        Priority.HIGH.valueOf(),
      );
      expect(milestones[0].initiatives[0].createdAt).toBeDefined();
      expect(milestones[0].initiatives[0].updatedAt).toBeDefined();
      expect(milestones[1].id).toBeDefined();
      expect(milestones[1].title).toEqual('my milestone 2');
      expect(milestones[1].dueDate).toEqual('2020-01-01');
      expect(milestones[1].initiatives.length).toEqual(0);
    });
  });
  describe('when getting a milestone', () => {
    it('should return the milestone', async () => {
      const milestone = await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      const foundMilestone = await service.get(
        org.id,
        project.id,
        milestone.id,
      );
      expect(foundMilestone.id).toEqual(milestone.id);
      expect(foundMilestone.title).toEqual(milestone.title);
      expect(foundMilestone.description).toEqual(milestone.description);
      expect(foundMilestone.timeline).toEqual('past');
      expect(foundMilestone.dueDate).toEqual(milestone.dueDate);
    });
  });
  describe('when updating a milestone', () => {
    it('should return the milestone', async () => {
      const milestone = await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      const updatedMilestone = await service.update(
        org.id,
        project.id,
        milestone.id,
        {
          title: 'my milestone updated',
          description: 'my milestone updated',
          dueDate: '2020-01-02',
        },
      );
      expect(updatedMilestone.id).toEqual(milestone.id);
      expect(updatedMilestone.title).toEqual('my milestone updated');
      expect(updatedMilestone.description).toEqual('my milestone updated');
      expect(updatedMilestone.dueDate).toEqual('2020-01-02');
    });
  });
  describe('when deleting a milestone', () => {
    it('should delete the milestone', async () => {
      const milestone = await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      await service.delete(org.id, project.id, milestone.id);
      await expect(
        service.get(org.id, project.id, milestone.id),
      ).rejects.toThrow();
    });
    it('should not delete the initiatives but remove the milestone reference', async () => {
      const milestone = await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      const initiative = await initiativesService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my initiative',
          description: 'my initiative description',
          priority: Priority.HIGH,
          milestone: milestone.id,
          status: InitiativeStatus.PLANNED,
        },
      );
      await service.delete(org.id, project.id, milestone.id);
      const foundFeature = await initiativesService.getInitiative(
        org.id,
        project.id,
        initiative.id,
      );
      expect(foundFeature.milestone).toBeUndefined();
    });
  });
  describe('when listing milestones for a timeline', () => {
    it('should return the milestones for the past timeline', async () => {
      await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: '2020-01-01',
      });
      const milestones = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.PAST,
      );
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual('my milestone');
      expect(milestones[0].dueDate).toEqual('2020-01-01');
      expect(milestones[0].timeline).toEqual('past');
    });
    it('should return the milestones for the current timeline', async () => {
      const dueDate = TimelineService.getStartAndEndDatesByTimelineValue(
        Timeline.THIS_QUARTER.valueOf(),
      ).endDate;
      dueDate.setDate(dueDate.getDate() - 1);
      await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: dueDate.toISOString().split('T')[0],
      });
      const milestones = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(milestones.length).toEqual(1);
    });
    it('should return the milestones for the future timeline', async () => {
      const dueDate = TimelineService.getStartAndEndDatesByTimelineValue(
        Timeline.NEXT_QUARTER.valueOf(),
      ).endDate;
      dueDate.setDate(dueDate.getDate() - 10);
      await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: dueDate.toISOString().split('T')[0],
      });
      const milestones = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.NEXT_QUARTER,
      );
      expect(milestones.length).toEqual(1);
    });
    it('should return the milestones for the later timeline', async () => {
      const { startDate: dueDate } = TimelineService.calculateQuarterDates(
        TimelineService.getCurrentQuarter() + 3,
      );
      dueDate.setDate(dueDate.getDate() + 10);
      await service.createMilestone(org.id, project.id, {
        title: 'my milestone',
        description: 'my milestone',
        dueDate: dueDate.toISOString().split('T')[0],
      });
      const milestones = await service.listForTimeline(
        org.id,
        project.id,
        Timeline.LATER,
      );
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual('my milestone');
      expect(milestones[0].dueDate).toEqual(
        dueDate.toISOString().split('T')[0],
      );
      expect(milestones[0].timeline).toEqual('later');
    });
  });
});
