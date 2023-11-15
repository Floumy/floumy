import { KeyResult } from "./key-result.entity";
import { Objective } from "./objective.entity";

export class OKRMapper {
  static toDTO(objective: Objective, keyResults: KeyResult[]) {
    return {
      objective: {
        id: objective.id,
        title: objective.title,
        description: objective.description,
        createdAt: objective.createdAt,
        updatedAt: objective.updatedAt
      },
      keyResults: keyResults.map(keyResult => ({
        id: keyResult.id,
        title: keyResult.title,
        createdAt: keyResult.createdAt,
        updatedAt: keyResult.updatedAt
      }))
    };
  }

  static toListDTO(objectives: Objective[]) {
    return objectives.map(objective => ({
      id: objective.id,
      title: objective.title,
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt
    }));
  }
}
