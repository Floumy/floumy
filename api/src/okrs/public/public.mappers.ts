import { ObjectiveDto } from './dtos';
import { Objective } from '../objective.entity';
import { TimelineService } from '../../common/timeline.service';
import { KeyResult } from '../key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { CommentMapper } from '../../comments/mappers';

export class PublicOkrMapper {
  static toDTO(objective: Objective): ObjectiveDto {
    return {
      id: objective.id,
      reference: objective.reference,
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

  static async toDetailDto(objective: Objective, keyResults: KeyResult[]) {
    const comments = await objective.comments;

    return {
      objective: {
        id: objective.id,
        reference: objective.reference,
        title: objective.title,
        timeline: TimelineService.startAndEndDatesToTimeline(
          objective.startDate,
          objective.endDate,
        ),
        progress: parseFloat(objective.progress.toFixed(2)),
        status: objective.status,
        comments: await CommentMapper.toDtoList(comments),
        startDate: objective.startDate,
        endDate: objective.endDate,
        createdAt: objective.createdAt,
        updatedAt: objective.updatedAt,
      },
      keyResults: await Promise.all(
        keyResults.map(PublicOkrMapper.toKeyResultDto),
      ),
    };
  }

  static async toKeyResultDto(keyResult: KeyResult) {
    const features = (await keyResult.features) || [];
    const comments = await keyResult.comments;

    return {
      id: keyResult.id,
      reference: keyResult.reference,
      title: keyResult.title,
      progress: parseFloat(keyResult.progress.toFixed(2)),
      status: keyResult.status,
      createdAt: keyResult.createdAt,
      updatedAt: keyResult.updatedAt,
      features: await Promise.all(features.map(PublicOkrMapper.toFeatureDto)),
      comments: await CommentMapper.toDtoList(comments),
    };
  }

  static async toFeatureDto(feature: Feature) {
    const workItems = (await feature.workItems) || [];
    return {
      id: feature.id,
      reference: feature.reference,
      title: feature.title,
      status: feature.status,
      priority: feature.priority,
      progress: parseFloat(feature.progress.toFixed(2)),
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
      workItems: workItems.map(PublicOkrMapper.toWorkItemDto),
    };
  }

  static toWorkItemDto(workItem: WorkItem) {
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      status: workItem.status,
      type: workItem.type,
      priority: workItem.priority,
      estimation: workItem.estimation,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
