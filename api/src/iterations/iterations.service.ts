import { Injectable } from '@nestjs/common';
import { CreateOrUpdateIterationDto } from './dtos';
import { Iteration } from './Iteration.entity';
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
import { IterationMapper } from './iteration.mapper';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { IterationStatus } from './iteration-status.enum';
import { Timeline } from '../common/timeline.enum';
import { TimelineService } from '../common/timeline.service';
import { Project } from '../projects/project.entity';

@Injectable()
export class IterationsService {
  constructor(
    @InjectRepository(Iteration)
    private iterationRepository: Repository<Iteration>,
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

  getIterationCalendarWeekNumbersForTitle(startDate: Date, endDate: Date) {
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
    iterationDto: CreateOrUpdateIterationDto,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const iteration = new Iteration();
    iteration.goal = iterationDto.goal;
    iteration.startDate = new Date(iterationDto.startDate);
    iteration.startDate.setUTCHours(0, 0, 0, 0);
    // Duration is in weeks
    iteration.duration = iterationDto.duration;
    iteration.endDate = this.getIterationEndDate(iteration);
    iteration.endDate.setUTCHours(23, 59, 59, 999);
    iteration.title = this.getIterationTitle(iteration);
    iteration.org = Promise.resolve(org);
    iteration.project = Promise.resolve(project);
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }

  async listWithWorkItems(orgId: string, projectId: string) {
    const iterations = await this.iterationRepository.find({
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
      iterations.map((iteration) => IterationMapper.toDto(iteration)),
    );
  }

  async findIteration(orgId: string, projectId: string, iterationId: string) {
    return await this.iterationRepository.findOneByOrFail({
      id: iterationId,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
  }

  async get(orgId: string, projectId: string, id: string) {
    const iteration = await this.findIteration(orgId, projectId, id);
    return await IterationMapper.toDto(iteration);
  }

  async update(
    orgId: string,
    projectId: string,
    id: string,
    updateIterationDto: CreateOrUpdateIterationDto,
  ) {
    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    iteration.goal = updateIterationDto.goal;
    iteration.startDate = new Date(updateIterationDto.startDate);
    iteration.startDate.setUTCHours(0, 0, 0, 0);
    // Duration is in weeks
    iteration.duration = updateIterationDto.duration;
    iteration.endDate = this.getIterationEndDate(iteration);
    iteration.title = this.getIterationTitle(iteration);
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }

  getIterationTitle(iteration: Iteration) {
    return `Sprint ${this.getIterationCalendarWeekNumbersForTitle(
      iteration.startDate,
      iteration.endDate,
    )} ${iteration.startDate.getFullYear()}`;
  }

  getIterationEndDate(iteration: Iteration) {
    const startDate = iteration.actualStartDate || iteration.startDate;
    return new Date(
      startDate.getTime() + iteration.duration * 7 * 24 * 60 * 60 * 1000 - 1,
    );
  }

  async delete(orgId: string, projectId: string, id: string) {
    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    await this.removeWorkItemsFromIteration(iteration);
    await this.iterationRepository.remove(iteration);
  }

  async startIteration(orgId: string, projectId: string, id: string) {
    await this.completeActiveIterationIfExists(orgId);

    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    iteration.actualStartDate = new Date();
    iteration.endDate = this.getIterationEndDate(iteration);
    iteration.status = IterationStatus.ACTIVE;
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }

  async findActiveIteration(orgId: string, projectId: string) {
    return await this.iterationRepository.findOneBy({
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
      status: IterationStatus.ACTIVE,
    });
  }

  async getActiveIteration(orgId: string, projectId: string) {
    const iteration = await this.findActiveIteration(orgId, projectId);
    return iteration ? await IterationMapper.toDto(iteration) : null;
  }

  async completeIteration(orgId: string, projectId: string, id: string) {
    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId,
      },
      project: {
        id: projectId,
      },
    });
    iteration.actualEndDate = new Date();
    iteration.status = IterationStatus.COMPLETED;
    iteration.velocity = await this.calculateIterationVelocity(iteration);
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }

  async list(orgId: string, projectId: string) {
    const iterations = await this.iterationRepository.find({
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
      iterations.map((iteration) => IterationMapper.toListItemDto(iteration)),
    );
  }

  async listForTimeline(orgId: string, projectId: string, timeline: Timeline) {
    const iterations = await this.findIterationsForTimeline(
      orgId,
      projectId,
      timeline,
    );
    return await Promise.all(
      iterations.map((iteration) => IterationMapper.toDto(iteration)),
    );
  }

  async findIterationsForTimeline(
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
    return await this.iterationRepository.find({
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

  private async removeWorkItemsFromIteration(iteration: Iteration) {
    const workItems = await iteration.workItems;
    for (const workItem of workItems) {
      workItem.iteration = Promise.resolve(null);
      await this.workItemsRepository.save(workItem);
    }
  }

  private async completeActiveIterationIfExists(orgId: string) {
    const activeIteration = await this.iterationRepository.findOneBy({
      org: {
        id: orgId,
      },
      status: IterationStatus.ACTIVE,
    });

    if (activeIteration) {
      activeIteration.actualEndDate = new Date();
      activeIteration.status = IterationStatus.COMPLETED;
      await this.iterationRepository.save(activeIteration);
    }
  }

  private async calculateIterationVelocity(iteration: Iteration) {
    const workItems = await iteration.workItems;
    return workItems
      .filter((workItem) => workItem.estimation)
      .reduce((sum, workItem) => sum + workItem.estimation, 0);
  }
}
