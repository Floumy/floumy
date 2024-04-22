import { ObjectiveDto } from './dtos';
import { Objective } from '../objective.entity';
import { TimelineService } from '../../common/timeline.service';

export class PublicOkrMapper {
  static toDTO(objective: Objective): ObjectiveDto {
    return {
      id: objective.id,
      reference: `O-${objective.sequenceNumber}`,
      title: objective.title,
      timeline: TimelineService.startAndEndDatesToTimeline(
        objective.startDate,
        objective.endDate,
      ),
      progress: parseFloat(objective.progress.toFixed(2)),
      status: objective.status,
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt,
    };
  }
}
