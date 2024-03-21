import { Injectable } from '@nestjs/common';
import { CreateUpdateMilestoneDto } from './dtos';
import { Milestone } from './milestone.entity';
import { Between, IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgsService } from '../../orgs/orgs.service';
import { MilestoneMapper } from './milestone.mapper';
import { Timeline } from '../../common/timeline.enum';
import { TimelineService } from '../../common/timeline.service';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    private orgsService: OrgsService,
  ) {}

  async createMilestone(
    orgId: string,
    createMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    this.validateMilestone(createMilestoneDto);
    const org = await this.orgsService.findOneById(orgId);
    const milestone = new Milestone();
    milestone.title = createMilestoneDto.title;
    milestone.description = createMilestoneDto.description;
    milestone.dueDate = new Date(createMilestoneDto.dueDate);
    milestone.org = Promise.resolve(org);
    const savedMilestone = await this.milestoneRepository.save(milestone);
    return await MilestoneMapper.toDto(savedMilestone);
  }

  private validateMilestone(createMilestoneDto: CreateUpdateMilestoneDto) {
    if (!createMilestoneDto.title)
      throw new Error('Milestone title is required');
    if (!createMilestoneDto.dueDate)
      throw new Error('Milestone due date is required');
    if (!/^\d{4}-\d{2}-\d{2}$/.exec(createMilestoneDto.dueDate))
      throw new Error('Invalid due date');
  }

  async findOneById(orgId: string, id: string) {
    return await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
  }

  async listMilestones(orgId: string) {
    return MilestoneMapper.toListDto(
      await this.milestoneRepository.find({
        where: { org: { id: orgId } },
        order: { dueDate: 'ASC' },
      }),
    );
  }

  async listMilestonesWithFeatures(orgId: string) {
    const milestones = await this.milestoneRepository.find({
      where: { org: { id: orgId } },
      order: { dueDate: 'ASC' },
      relations: ['features'],
    });
    return await MilestoneMapper.toListWithFeaturesDto(milestones);
  }

  async get(orgId: string, id: string) {
    const milestone = await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
    return await MilestoneMapper.toDto(milestone);
  }

  async update(
    orgId: string,
    id: string,
    updateMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    this.validateMilestone(updateMilestoneDto);
    const milestone = await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
    milestone.title = updateMilestoneDto.title;
    milestone.description = updateMilestoneDto.description;
    milestone.dueDate = new Date(updateMilestoneDto.dueDate);
    const savedMilestone = await this.milestoneRepository.save(milestone);
    return await MilestoneMapper.toDto(savedMilestone);
  }

  async delete(orgId: string, id: string) {
    const milestone = await this.milestoneRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
    const features = await milestone.features;
    features.forEach((feature) => (feature.milestone = null));
    await this.milestoneRepository.manager.save(features);
    await this.milestoneRepository.remove(milestone);
  }

  async listForTimeline(orgId: string, timeline: Timeline) {
    let where = {
      org: { id: orgId },
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
    });

    return await Promise.all(milestones.map(MilestoneMapper.toDto));
  }
}
