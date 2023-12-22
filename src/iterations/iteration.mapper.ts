import { Iteration } from "./Iteration.entity";
import { TimelineService } from "../common/timeline.service";

export class IterationMapper {
  static toDto(iteration: Iteration) {
    return {
      id: iteration.id,
      title: iteration.title,
      goal: iteration.goal,
      startDate: iteration.startDate.toISOString().split("T")[0],
      endDate: iteration.endDate.toISOString().split("T")[0],
      timeline: TimelineService.convertDateToTimeline(iteration.startDate),
      duration: iteration.duration,
      createdAt: iteration.createdAt,
      updatedAt: iteration.updatedAt
    };
  }
}
