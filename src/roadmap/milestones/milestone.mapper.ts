import { Milestone } from "./milestone.entity";
import { MilestoneDto, MilestoneListItemDto, MilestoneListWithFeaturesItemDto } from "./dtos";
import { TimelineService } from "../../common/timeline.service";

export class MilestoneMapper {
  static toDto(milestone: Milestone): MilestoneDto {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      dueDate: MilestoneMapper.formatDate(milestone.dueDate),
      timeline: TimelineService.convertDateToTimeline(milestone.dueDate).valueOf(),
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt
    };
  }

  static toListDto(milestones: Milestone[]): MilestoneListItemDto[] {
    return milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      timeline: TimelineService.convertDateToTimeline(milestone.dueDate).valueOf(),
      dueDate: MilestoneMapper.formatDate(milestone.dueDate)
    }));
  }

  static async toListWithFeaturesDto(milestones: Milestone[]): Promise<MilestoneListWithFeaturesItemDto[]> {
    return await Promise.all(milestones.map(async milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      dueDate: MilestoneMapper.formatDate(milestone.dueDate),
      timeline: TimelineService.convertDateToTimeline(milestone.dueDate).valueOf(),
      features: (await milestone.features).map(feature => ({
        id: feature.id,
        title: feature.title,
        priority: feature.priority.valueOf(),
        status: feature.status.valueOf(),
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt
      }))
    })));
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  };
}
