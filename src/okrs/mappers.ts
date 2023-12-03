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
        timeline: TimelineService.startAndEndDatesToTimeline(objective.startDate, objective.endDate)
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

export class KeyResultMapper {
  static async toDTO(keyResult: KeyResult): Promise<KeyResultDto> {
    const objective = await keyResult.objective;
    return {
      id: keyResult.id,
      title: keyResult.title,
      progress: parseFloat(keyResult.progress?.toFixed(2)),
      timeline: TimelineService.startAndEndDatesToTimeline(objective.startDate, objective.endDate),
      createdAt: keyResult.createdAt,
      updatedAt: keyResult.updatedAt,
      status: keyResult.status
    };
  }

  static toListDTO(keyResults: KeyResult[]): Promise<KeyResultDto[]> {
    return Promise.all(keyResults.map(KeyResultMapper.toDTO));
  }
}
