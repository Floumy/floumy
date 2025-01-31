import { Injectable } from '@nestjs/common';
import { CreateOrUpdateSprintDto } from './dtos';
import { Sprint } from './sprint.entity';
import {
  And,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Org } from '../orgs/org.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SprintMapper } from './sprint.mapper';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { SprintStatus } from './sprint-status.enum';
import { Timeline } from '../common/timeline.enum';
import { TimelineService } from '../common/timeline.service';
import { Project } from '../projects/project.entity';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
  ) {}

  getWeekNumber(d: Date): number {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  getSprintCalendarWeekNumbersForTitle(startDate: Date, endDate: Date) {
    const startWeekNumber = this.getWeekNumber(startDate);
    const endWeekNumber = this.getWeekNumber(endDate);
    if (startWeekNumber === endWeekNumber) {
      return `CW${startWeekNumber}`;
    }

    return `CW${startWeekNumber}-CW${endWeekNumber}`;
  }

  async create(
    orgId: string,
    projectId: string,
    sprintDto: CreateOrUpdateSprintDto,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const sprint = new Sprint();
    sprint.goal = sprintDto.goal;
    sprint.startDate = new Date(sprintDto.startDate);
    sprint.startDate.setUTCHours(0, 0, 0, 0);
    // Duration is in weeks
    sprint.duration = sprintDto.duration;
    sprint.endDate = this.getSprintEndDate(sprint);
    sprint.endDate.setUTCHours(23, 59, 59, 999);
    sprint.title = this.getSprintTitle(sprint);
    sprint.org = Promise.resolve(org);
    sprint.project = Promise.resolve(project);
    const savedSprint = await this.sprintRepository.save(sprint);
    return await SprintMapper.toDto(savedSprint);
  }

  async listWithWorkItems(orgId: string, projectId: string) {
    const sprints = await this.sprintRepository.find({
      where: {
        org: {
          id: orgId,
        },
        project: {
          id: projectId,
        },
      },
      order: {
        startDate: 'DESC',
      },
    });
    return await Promise.all(
      sprints.map((sprint) => SprintMapper.toDto(sprint)),
    );
  }

  async findSprint(orgId: string, projectId: string, sprintId: string) {
    return await this.sprintRepository.findOneByOrFail({
      id: sprintId,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
  }

  async get(orgId: string, projectId: string, id: string) {
    const sprint = await this.findSprint(orgId, projectId, id);
    return await SprintMapper.toDto(sprint);
  }

  async update(
    orgId: string,
    projectId: string,
    id: string,
    updateSprintDto: CreateOrUpdateSprintDto,
  ) {
    const sprint = await this.sprintRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    sprint.goal = updateSprintDto.goal;
    sprint.startDate = new Date(updateSprintDto.startDate);
    sprint.startDate.setUTCHours(0, 0, 0, 0);
    // Duration is in weeks
    sprint.duration = updateSprintDto.duration;
    sprint.endDate = this.getSprintEndDate(sprint);
    sprint.title = this.getSprintTitle(sprint);
    const savedSprint = await this.sprintRepository.save(sprint);
    return await SprintMapper.toDto(savedSprint);
  }

  getSprintTitle(sprint: Sprint) {
    return `Sprint ${this.getSprintCalendarWeekNumbersForTitle(
      sprint.startDate,
      sprint.endDate,
    )} ${sprint.endDate.getFullYear()}`;
  }

  getSprintEndDate(sprint: Sprint) {
    const startDate = sprint.actualStartDate || sprint.startDate;
    return new Date(
      startDate.getTime() + sprint.duration * 7 * 24 * 60 * 60 * 1000 - 1,
    );
  }

  async delete(orgId: string, projectId: string, id: string) {
    const sprint = await this.sprintRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    await this.removeWorkItemsFromSprint(sprint);
    await this.sprintRepository.remove(sprint);
  }

  async startSprint(orgId: string, projectId: string, id: string) {
    await this.completeActiveSprintIfExists(orgId);

    const sprint = await this.sprintRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    sprint.actualStartDate = new Date();
    sprint.endDate = this.getSprintEndDate(sprint);
    sprint.status = SprintStatus.ACTIVE;
    const savedSprint = await this.sprintRepository.save(sprint);
    return await SprintMapper.toDto(savedSprint);
  }

  async findActiveSprint(orgId: string, projectId: string) {
    return await this.sprintRepository.findOneBy({
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
      status: SprintStatus.ACTIVE,
    });
  }

  async getActiveSprint(orgId: string, projectId: string) {
    const sprint = await this.findActiveSprint(orgId, projectId);
    return sprint ? await SprintMapper.toDto(sprint) : null;
  }

  async completeSprint(orgId: string, projectId: string, id: string) {
    const sprint = await this.sprintRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    sprint.actualEndDate = new Date();
    sprint.status = SprintStatus.COMPLETED;
    sprint.velocity = await this.calculateSprintVelocity(sprint);
    const savedSprint = await this.sprintRepository.save(sprint);
    return await SprintMapper.toDto(savedSprint);
  }

  async list(orgId: string, projectId: string) {
    const sprints = await this.sprintRepository.find({
      where: {
        org: {
          id: orgId,
        },
        project: {
          id: projectId,
        },
      },
      order: {
        startDate: 'DESC',
      },
    });
    return await Promise.all(
      sprints.map((sprint) => SprintMapper.toListItemDto(sprint)),
    );
  }

  async listForTimeline(orgId: string, projectId: string, timeline: Timeline) {
    const sprints = await this.findSprintsForTimeline(
      orgId,
      projectId,
      timeline,
    );
    return await Promise.all(
      sprints.map((sprint) => SprintMapper.toDto(sprint)),
    );
  }

  async findSprintsForTimeline(
    orgId: string,
    projectId: string,
    timeline: Timeline | Timeline.THIS_QUARTER | Timeline.NEXT_QUARTER,
  ) {
    let where = {
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    } as any;
    switch (timeline) {
      case Timeline.THIS_QUARTER:
      case Timeline.NEXT_QUARTER: {
        const { startDate, endDate } =
          TimelineService.getStartAndEndDatesByTimelineValue(
            timeline.valueOf(),
          );
        where = [
          {
            org: { id: orgId },
            project: { id: projectId },
            startDate: And(
              MoreThanOrEqual(startDate),
              LessThanOrEqual(endDate),
            ),
          },
          {
            org: { id: orgId },
            project: { id: projectId },
            endDate: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
          },
        ];
        break;
      }
      case Timeline.LATER: {
        const nextQuarterEndDate = TimelineService.calculateQuarterDates(
          TimelineService.getCurrentQuarter() + 1,
        ).endDate;
        where = [
          {
            org: { id: orgId },
            project: { id: projectId },
            startDate: MoreThan(nextQuarterEndDate),
          },
          {
            org: { id: orgId },
            project: { id: projectId },
            startDate: IsNull(),
          },
        ];
        break;
      }
      case Timeline.PAST: {
        const { startDate } = TimelineService.calculateQuarterDates(
          TimelineService.getCurrentQuarter(),
        );
        where.startDate = LessThan(startDate);
        break;
      }
    }
    return await this.sprintRepository.find({
      where,
      order: {
        startDate: 'DESC',
      },
      relations: [
        'workItems',
        'workItems.feature',
        'workItems.feature.milestone',
        'workItems.assignedTo',
      ],
    });
  }

  private async removeWorkItemsFromSprint(sprint: Sprint) {
    const workItems = await sprint.workItems;
    for (const workItem of workItems) {
      workItem.sprint = Promise.resolve(null);
      await this.workItemsRepository.save(workItem);
    }
  }

  private async completeActiveSprintIfExists(orgId: string) {
    const activeSprint = await this.sprintRepository.findOneBy({
      org: {
        id: orgId,
      },
      status: SprintStatus.ACTIVE,
    });

    if (activeSprint) {
      activeSprint.actualEndDate = new Date();
      activeSprint.status = SprintStatus.COMPLETED;
      await this.sprintRepository.save(activeSprint);
    }
  }

  private async calculateSprintVelocity(sprint: Sprint) {
    const workItems = await sprint.workItems;
    return workItems
      .filter((workItem) => workItem.estimation)
      .reduce((sum, workItem) => sum + workItem.estimation, 0);
  }
}
