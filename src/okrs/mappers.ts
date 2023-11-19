import { KeyResult } from "./key-result.entity";
import { Objective } from "./objective.entity";

export class OKRMapper {
  static toDTO(objective: Objective, keyResults: KeyResult[]) {
    return {
      objective: {
        id: objective.id,
        title: objective.title,
        progress: parseFloat(objective.progress?.toFixed(2)),
        createdAt: objective.createdAt,
        updatedAt: objective.updatedAt,
        status: objective.status
      },
      keyResults: keyResults.map(KeyResultMapper.toDTO)
    };
  }

  static toListDTO(objectives: Objective[]) {
    return objectives.map(objective => ({
      id: objective.id,
      title: objective.title,
      status: objective.status,
      progress: parseFloat(objective.progress?.toFixed(2)),
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt
    }));
  }
}

export class KeyResultMapper {
  static toDTO(keyResult: KeyResult) {
    return {
      id: keyResult.id,
      title: keyResult.title,
      progress: parseFloat(keyResult.progress?.toFixed(2)),
      createdAt: keyResult.createdAt,
      updatedAt: keyResult.updatedAt,
      status: keyResult.status
    };
  }
}
