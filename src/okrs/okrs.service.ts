import { Injectable } from "@nestjs/common";
import { Objective } from "./objective.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OkrsService {

  constructor(@InjectRepository(Objective)
              private objectiveRepository: Repository<Objective>) {
  }

  async createObjective(objective: string, description: string) {
    if (!objective) throw new Error("Objective is required");
    return await this.objectiveRepository.save({ objective, description });
  }

  async findObjectiveById(id: string) {
    return await this.objectiveRepository.findOneBy({ id });
  }
}
