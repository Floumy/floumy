import { Injectable } from '@nestjs/common';
import { CreateUpdateMilestoneDto } from './dtos';
import { Milestone } from './milestone.entity';
import { Between, IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgsService } from '../../orgs/orgs.service';
import { MilestoneMapper } from './milestone.mapper';
import { Timeline } from '../../common/timeline.enum';
import { TimelineService } from '../../common/timeline.service';
import { Project } from '../../projects/project.entity';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    private orgsService: OrgsService,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
  ) {}

  async createMilestone(
    orgId: string,
    projectId: string,
    createMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    this.validateMilestone(createMilestoneDto);
    const org = await this.orgsService.findOneById(orgId);
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const milestone = new Milestone();
    milestone.title = createMilestoneDto.title;
    milestone.description = createMilestoneDto.description;
    milestone.dueDate = new Date(createMilestoneDto.dueDate);
    milestone.org = Promise.resolve(org);
    milestone.project = Promise.resolve(project);
    const savedMilestone = await this.milestoneRepository.save(milestone);
    return await MilestoneMapper.toDto(savedMilestone);
  }

  async findOneById(orgId: string, projectId: string, id: string) {
    return await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
  }

  async listMilestones(orgId: string, projectId: string) {
    return MilestoneMapper.toListDto(
      await this.milestoneRepository.find({
        where: { org: { id: orgId }, project: { id: projectId } },
        order: { dueDate: 'DESC' },
      }),
    );
  }

  async listMilestonesWithInitiatives(orgId: string, projectId: string) {
    const milestones = await this.milestoneRepository.find({
      where: { org: { id: orgId }, project: { id: projectId } },
      order: { dueDate: 'DESC' },
      relations: ['initiatives'],
    });
    return await MilestoneMapper.toListWithInitiativesDto(milestones);
  }

  async get(orgId: string, projectId: string, id: string) {
    const milestone = await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    return await MilestoneMapper.toDto(milestone);
  }

  async update(
    orgId: string,
    projectId: string,
    id: string,
    updateMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    this.validateMilestone(updateMilestoneDto);
    const milestone = await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    milestone.title = updateMilestoneDto.title;
    milestone.description = updateMilestoneDto.description;
    milestone.dueDate = new Date(updateMilestoneDto.dueDate);
    const savedMilestone = await this.milestoneRepository.save(milestone);
    return await MilestoneMapper.toDto(savedMilestone);
  }

  async delete(orgId: string, projectId: string, id: string) {
    const milestone = await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    const initiatives = await milestone.initiatives;
    initiatives.forEach((initiative) => (initiative.milestone = null));
    await this.milestoneRepository.manager.save(initiatives);
    await this.milestoneRepository.remove(milestone);
  }

  async listForTimeline(orgId: string, projectId: string, timeline: Timeline) {
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
        where.dueDate = Between(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        );
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
            dueDate: MoreThan(nextQuarterEndDate),
          },
          { org: { id: orgId }, dueDate: IsNull() },
        ];
        break;
      }
      case Timeline.PAST: {
        const { startDate } = TimelineService.calculateQuarterDates(
          TimelineService.getCurrentQuarter(),
        );
        where.dueDate = LessThan(startDate);
        break;
      }
    }

    const milestones = await this.milestoneRepository.find({
      where,
      order: {
        dueDate: 'DESC',
      },
    });

    return await Promise.all(milestones.map(MilestoneMapper.toDto));
  }

  private validateMilestone(createMilestoneDto: CreateUpdateMilestoneDto) {
    if (!createMilestoneDto.title)
      throw new Error('Milestone title is required');
    if (!createMilestoneDto.dueDate)
      throw new Error('Milestone due date is required');
    if (!/^\d{4}-\d{2}-\d{2}$/.exec(createMilestoneDto.dueDate))
      throw new Error('Invalid due date');
  }
}
