import { KeyResult } from "./key-result.entity";
import { Objective } from "./objective.entity";
import { TimelineService } from "../common/timeline.service";

export class OKRMapper {

  static async toDTO(objective: Objective, keyResults: KeyResult[]) {
    return {
      objective: {
        id: objective.id,
        title: objective.title,
        progress: parseFloat(objective.progress?.toFixed(2)),
        createdAt: objective.createdAt,
        updatedAt: objective.updatedAt,
        status: objective.status,
        timeline: TimelineService.startAndEndDatesToTimeline(objective.startDate, objective.endDate),
        startDate: objective.startDate,
        endDate: objective.endDate
      },
      keyResults: await KeyResultMapper.toListDTO(keyResults)
    };
  }

  static toListDTO(objectives: Objective[]) {
    return objectives.map(objective => ({
      id: objective.id,
      title: objective.title,
      status: objective.status,
      timeline: TimelineService.startAndEndDatesToTimeline(objective.startDate, objective.endDate),
      progress: parseFloat(objective.progress?.toFixed(2)),
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt
    }));
  }
}

class FeatureMapper {
  static async toDTO(feature): Promise<FeatureDto> {
    return {
      id: feature.id,
      title: feature.title,
      priority: feature.priority,
      status: feature.status,
      workItemsCount: feature.workItemsCount,
      progress: feature.progress,
      workItems: (await feature.workItems).map(WorkItemMapper.toDto),
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt
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
      updatedAt: workItem.updatedAt
    };
  }
}

export class KeyResultMapper {
  static async toDTO(keyResult: KeyResult): Promise<KeyResultDto> {
    const objective = await keyResult.objective;
    const features = await keyResult.features;
    return {
      id: keyResult.id,
      title: keyResult.title,
      progress: keyResult.progress ? parseFloat(keyResult.progress?.toFixed(2)) : 0,
      timeline: TimelineService.startAndEndDatesToTimeline(objective.startDate, objective.endDate),
      createdAt: keyResult.createdAt,
      updatedAt: keyResult.updatedAt,
      status: keyResult.status,
      features: await Promise.all(features.map(FeatureMapper.toDTO))
    };
  }

  static toListDTO(keyResults: KeyResult[]): Promise<KeyResultDto[]> {
    return Promise.all(keyResults.map(KeyResultMapper.toDTO));
  }
}
