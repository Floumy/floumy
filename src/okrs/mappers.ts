import { KeyResult } from "./key-result.entity";
import { Objective } from "./objective.entity";

export class OKRMapper {

  static startAndEndDatesToTimeline(startDate: Date, endDate: Date) {
    const now = new Date();
    if (!startDate && !endDate) {
      return "later";
    }

    if (endDate.getTime() < now.getTime()) {
      return "past";
    }

    if (startDate.getTime() <= now.getTime() && endDate.getTime() >= now.getTime()) {
      return "this-quarter";
    }

    if (startDate.getTime() > now.getTime()) {
      return "next-quarter";
    }

    return "later";
  }

  static toDTO(objective: Objective, keyResults: KeyResult[]) {
    return {
      objective: {
        id: objective.id,
        title: objective.title,
        progress: parseFloat(objective.progress?.toFixed(2)),
        createdAt: objective.createdAt,
        updatedAt: objective.updatedAt,
        status: objective.status,
        timeline: OKRMapper.startAndEndDatesToTimeline(objective.startDate, objective.endDate)
      },
      keyResults: keyResults.map(KeyResultMapper.toDTO)
    };
  }

  static toListDTO(objectives: Objective[]) {
    return objectives.map(objective => ({
      id: objective.id,
      title: objective.title,
      status: objective.status,
      timeline: OKRMapper.startAndEndDatesToTimeline(objective.startDate, objective.endDate),
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
