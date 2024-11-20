import { KeyResult } from './key-result.entity';
import { Objective } from './objective.entity';
import { TimelineService } from '../common/timeline.service';
import { FeatureDto, KeyResultDto, OKRDto } from './dtos';
import { CommentMapper } from '../comments/mappers';
import { Feature } from '../roadmap/features/feature.entity';

export class OKRMapper {
  static async toDTO(
    objective: Objective,
    keyResults: KeyResult[],
  ): Promise<OKRDto> {
    const assignedTo = await objective.assignedTo;
    const org = await objective.org;
    const project = await objective.project;
    return {
      objective: {
        id: objective.id,
        org: {
          id: org.id,
          name: org.name,
        },
        project: {
          id: project.id,
        },
        reference: `O-${objective.sequenceNumber}`,
        title: objective.title,
        progress: parseFloat(objective.progress?.toFixed(2)),
        createdAt: objective.createdAt,
        updatedAt: objective.updatedAt,
        status: objective.status,
        timeline: TimelineService.startAndEndDatesToTimeline(
          objective.startDate,
          objective.endDate,
        ),
        startDate: objective.startDate,
        endDate: objective.endDate,
        assignedTo: assignedTo
          ? {
              id: assignedTo.id,
              name: assignedTo.name,
            }
          : undefined,
      },
      keyResults: await KeyResultMapper.toListDTO(keyResults),
    };
  }

  static async toDTOWithComments(objective, keyResults) {
    const dto = await OKRMapper.toDTO(objective, keyResults);
    const comments = await objective.comments;

    return {
      objective: {
        ...dto.objective,
        comments: await CommentMapper.toDtoList(comments),
      },
      keyResults: dto.keyResults,
    };
  }

  static async toListDTO(objectives: Objective[]) {
    return await Promise.all(objectives.map(OKRMapper.toListItemDto));
  }

  static async toListItemDto(objective: Objective) {
    const assignedTo = await objective.assignedTo;
    return {
      id: objective.id,
      reference: `O-${objective.sequenceNumber}`,
      title: objective.title,
      status: objective.status,
      timeline: TimelineService.startAndEndDatesToTimeline(
        objective.startDate,
        objective.endDate,
      ),
      progress: parseFloat(objective.progress?.toFixed(2)),
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : null,
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt,
    };
  }
}

class FeatureMapper {
  static async toDTO(feature: Feature): Promise<FeatureDto> {
    return {
      id: feature.id,
      reference: `F-${feature.sequenceNumber}`,
      title: feature.title,
      priority: feature.priority,
      status: feature.status,
      workItemsCount: feature.workItemsCount,
      progress: feature.progress,
      workItems: (await feature.workItems).map(WorkItemMapper.toDto),
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
  }
}

class WorkItemMapper {
  static toDto(workItem) {
    return {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}

export class KeyResultMapper {
  static async toDTO(keyResult: KeyResult): Promise<KeyResultDto> {
    const objective = await keyResult.objective;
    const features = await keyResult.features;
    const org = await keyResult.org;
    const project = await keyResult.project;

    return {
      id: keyResult.id,
      reference: `KR-${keyResult.sequenceNumber}`,
      title: keyResult.title,
      objective: {
        id: objective.id,
        reference: `O-${objective.sequenceNumber}`,
        title: objective.title,
      },
      org: {
        id: org.id,
        name: org.name,
      },
      project: {
        id: project.id,
      },
      progress: keyResult.progress
        ? parseFloat(keyResult.progress?.toFixed(2))
        : 0,
      timeline: TimelineService.startAndEndDatesToTimeline(
        objective.startDate,
        objective.endDate,
      ),
      createdAt: keyResult.createdAt,
      updatedAt: keyResult.updatedAt,
      status: keyResult.status,
      features: await Promise.all(features.map(FeatureMapper.toDTO)),
    };
  }

  static async toDtoWithComments(keyResult) {
    const dto = await KeyResultMapper.toDTO(keyResult);
    const comments = await keyResult.comments;

    return {
      ...dto,
      comments: await CommentMapper.toDtoList(comments),
    };
  }

  static toListDTO(keyResults: KeyResult[]): Promise<KeyResultDto[]> {
    return Promise.all(keyResults.map(KeyResultMapper.toDTO));
  }
}
