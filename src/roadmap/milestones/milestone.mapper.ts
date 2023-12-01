import { Milestone } from "./milestone.entity";
import { MilestoneDto, MilestoneListItemDto } from "./dtos";
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
      dueDate: MilestoneMapper.formatDate(milestone.dueDate)
    }));
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  };
}
