import { Injectable } from "@nestjs/common";
import { Objective } from "./objective.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OrgsService } from "../orgs/orgs.service";

@Injectable()
export class OkrsService {

  constructor(@InjectRepository(Objective)
              private objectiveRepository: Repository<Objective>,
              private orgsService: OrgsService) {
  }

  async createObjective(orgId: string, objective: string, description: string) {
    if (!objective) throw new Error("Objective is required");
    const org = await this.orgsService.findOneById(orgId);
    if (!org) throw new Error("Organization not found");
    const objectiveEntity = new Objective();
    objectiveEntity.objective = objective;
    objectiveEntity.description = description;
    objectiveEntity.org = Promise.resolve(org);
    return await this.objectiveRepository.save(objectiveEntity);
  }

  async findObjectiveById(id: string) {
    return await this.objectiveRepository.findOneBy({ id });
  }

  async list(orgId: string) {
    return await this.objectiveRepository.findBy({ org: { id: orgId } });
  }
}
