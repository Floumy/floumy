import { Injectable } from '@nestjs/common';
import { CreateOrUpdateCycleDto } from './dtos';
import { Cycle } from './cycle.entity';
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
import { CycleMapper } from './cycle.mapper';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { CycleStatus } from './cycle-status.enum';
import { Timeline } from '../common/timeline.enum';
import { TimelineService } from '../common/timeline.service';
import { Project } from '../projects/project.entity';

@Injectable()
export class CyclesService {
  constructor(
    @InjectRepository(Cycle)
    private cycleRepository: Repository<Cycle>,
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
  ) {}

  getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  getCycleCalendarWeekNumbersForTitle(startDate: Date, endDate: Date) {
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
    cycleDto: CreateOrUpdateCycleDto,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const cycle = new Cycle();
    cycle.goal = cycleDto.goal;
    cycle.startDate = new Date(cycleDto.startDate);
    cycle.startDate.setUTCHours(0, 0, 0, 0);
    cycle.duration = cycleDto.duration;
    cycle.endDate = this.getCycleEndDate(cycle);
    cycle.endDate.setUTCHours(23, 59, 59, 999);
    cycle.title = this.getCycleTitle(cycle);
    cycle.org = Promise.resolve(org);
    cycle.project = Promise.resolve(project);
    const savedCycle = await this.cycleRepository.save(cycle);
    return await CycleMapper.toDto(savedCycle);
  }

  async listWithWorkItems(orgId: string, projectId: string) {
    const cycles = await this.cycleRepository.find({
      where: {
        org: { id: orgId },
        project: { id: projectId },
      },
      order: { startDate: 'DESC' },
    });
    return await Promise.all(cycles.map((cycle) => CycleMapper.toDto(cycle)));
  }

  async findCycle(orgId: string, projectId: string, cycleId: string) {
    return await this.cycleRepository.findOneByOrFail({
      id: cycleId,
      org: { id: orgId },
      project: { id: projectId },
    });
  }

  async get(orgId: string, projectId: string, id: string) {
    const cycle = await this.findCycle(orgId, projectId, id);
    return await CycleMapper.toDto(cycle);
  }

  async update(
    orgId: string,
    projectId: string,
    id: string,
    updateCycleDto: CreateOrUpdateCycleDto,
  ) {
    const cycle = await this.cycleRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      project: { id: projectId },
    });
    cycle.goal = updateCycleDto.goal;
    cycle.startDate = new Date(updateCycleDto.startDate);
    cycle.startDate.setUTCHours(0, 0, 0, 0);
    cycle.duration = updateCycleDto.duration;
    cycle.endDate = this.getCycleEndDate(cycle);
    cycle.title = this.getCycleTitle(cycle);
    const savedCycle = await this.cycleRepository.save(cycle);
    return await CycleMapper.toDto(savedCycle);
  }

  getCycleTitle(cycle: Cycle) {
    return `Cycle ${this.getCycleCalendarWeekNumbersForTitle(
      cycle.startDate,
      cycle.endDate,
    )} ${cycle.endDate.getFullYear()}`;
  }

  getCycleEndDate(cycle: Cycle) {
    const startDate = cycle.actualStartDate || cycle.startDate;
    return new Date(
      startDate.getTime() + cycle.duration * 7 * 24 * 60 * 60 * 1000 - 1,
    );
  }

  async delete(orgId: string, projectId: string, id: string) {
    const cycle = await this.cycleRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      project: { id: projectId },
    });
    await this.removeWorkItemsFromCycle(cycle);
    await this.cycleRepository.remove(cycle);
  }

  async startCycle(orgId: string, projectId: string, id: string) {
    await this.completeActiveCycleIfExists(orgId);

    const cycle = await this.cycleRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      project: { id: projectId },
    });
    cycle.actualStartDate = new Date();
    cycle.endDate = this.getCycleEndDate(cycle);
    cycle.status = CycleStatus.ACTIVE;
    const savedCycle = await this.cycleRepository.save(cycle);
    return await CycleMapper.toDto(savedCycle);
  }

  async findActiveCycle(orgId: string, projectId: string) {
    return await this.cycleRepository.findOneBy({
      org: { id: orgId },
      project: { id: projectId },
      status: CycleStatus.ACTIVE,
    });
  }

  async getActiveCycle(orgId: string, projectId: string) {
    const cycle = await this.findActiveCycle(orgId, projectId);
    return cycle ? await CycleMapper.toDto(cycle) : null;
  }

  async completeCycle(orgId: string, projectId: string, id: string) {
    const cycle = await this.cycleRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      project: { id: projectId },
    });
    cycle.actualEndDate = new Date();
    cycle.status = CycleStatus.COMPLETED;
    cycle.velocity = await this.calculateCycleVelocity(cycle);
    const savedCycle = await this.cycleRepository.save(cycle);
    return await CycleMapper.toDto(savedCycle);
  }

  async list(orgId: string, projectId: string) {
    const cycles = await this.cycleRepository.find({
      where: {
        org: { id: orgId },
        project: { id: projectId },
      },
      order: { startDate: 'DESC' },
    });
    return await Promise.all(
      cycles.map((cycle) => CycleMapper.toListItemDto(cycle)),
    );
  }

  async listForTimeline(orgId: string, projectId: string, timeline: Timeline) {
    const cycles = await this.findCyclesForTimeline(orgId, projectId, timeline);
    return await Promise.all(cycles.map((cycle) => CycleMapper.toDto(cycle)));
  }

  async findCyclesForTimeline(
    orgId: string,
    projectId: string,
    timeline: Timeline | Timeline.THIS_QUARTER | Timeline.NEXT_QUARTER,
  ) {
    let where = {
      org: { id: orgId },
      project: { id: projectId },
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
    return await this.cycleRepository.find({
      where,
      order: { startDate: 'DESC' },
      relations: [
        'workItems',
        'workItems.initiative',
        'workItems.initiative.milestone',
        'workItems.assignedTo',
      ],
    });
  }

  private async removeWorkItemsFromCycle(cycle: Cycle) {
    const workItems = await cycle.workItems;
    for (const workItem of workItems) {
      workItem.cycle = Promise.resolve(null);
      await this.workItemsRepository.save(workItem);
    }
  }

  private async completeActiveCycleIfExists(orgId: string) {
    const activeCycle = await this.cycleRepository.findOneBy({
      org: { id: orgId },
      status: CycleStatus.ACTIVE,
    });

    if (activeCycle) {
      activeCycle.actualEndDate = new Date();
      activeCycle.status = CycleStatus.COMPLETED;
      await this.cycleRepository.save(activeCycle);
    }
  }

  private async calculateCycleVelocity(cycle: Cycle) {
    const workItems = await cycle.workItems;
    return workItems
      .filter((workItem) => workItem.estimation)
      .reduce((sum, workItem) => sum + workItem.estimation, 0);
  }
}
