import { ObjectiveDto } from './dtos';
import { Objective } from '../objective.entity';
import { TimelineService } from '../../common/timeline.service';
import { KeyResult } from '../key-result.entity';

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

  static toDetailDto(objective: Objective, keyResults: KeyResult[]) {
    return {
      objective: {
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
      },
      keyResults: keyResults.map((keyResult) => ({
        id: keyResult.id,
        reference: `KR-${keyResult.sequenceNumber}`,
        title: keyResult.title,
        progress: parseFloat(keyResult.progress.toFixed(2)),
        status: keyResult.status,
        createdAt: keyResult.createdAt,
        updatedAt: keyResult.updatedAt,
      })),
    };
  }
}
