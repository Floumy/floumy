import { Injectable } from "@nestjs/common";
import { Objective } from "./objective.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OrgsService } from "../orgs/orgs.service";
import { KeyResult } from "./key-result.entity";

@Injectable()
export class OkrsService {

  constructor(@InjectRepository(Objective)
              private objectiveRepository: Repository<Objective>,
              @InjectRepository(KeyResult)
              private keyResultRepository: Repository<KeyResult>,
              private orgsService: OrgsService) {
  }

  async createObjective(orgId: string, title: string, description: string) {
    if (!title) throw new Error("Objective title is required");
    const org = await this.orgsService.findOneById(orgId);
    if (!org) throw new Error("Organization not found");
    const objectiveEntity = new Objective();
    objectiveEntity.title = title;
    objectiveEntity.description = description;
    objectiveEntity.org = Promise.resolve(org);
    return await this.objectiveRepository.save(objectiveEntity);
  }

  async createKeyResult(objective: Objective, title: string) {
    if (!title) throw new Error("Key Result title is required");
    const keyResultEntity = new KeyResult();
    keyResultEntity.title = title;
    keyResultEntity.objective = Promise.resolve(objective);
    return await this.keyResultRepository.save(keyResultEntity);
  }

  async findObjectiveById(id: string) {
    return await this.objectiveRepository.findOneBy({ id });
  }

  async list(orgId: string) {
    return await this.objectiveRepository.findBy({ org: { id: orgId } });
  }

  async get(orgId: any, id: string) {
    return await this.objectiveRepository.findOneByOrFail({ id, org: { id: orgId } });
  }

  async update(orgId: any, id: string, title: string, description: string) {
    return await this.objectiveRepository.update({ id, org: { id: orgId } }, { title, description });
  }

  async delete(orgId: string, id: string) {
    return await this.objectiveRepository.delete({ id, org: { id: orgId } });
  }

  async create(orgId: string, okrDto: OKRDto) {
    const objective = await this.createObjective(orgId, okrDto.objective.title, okrDto.objective.description);
    if (!okrDto.keyResults || okrDto.keyResults.length === 0) return { objective, keyResults: [] };

    const keyResults = await Promise.all(okrDto.keyResults.map(keyResult => this.createKeyResult(objective, keyResult)));

    return { objective, keyResults };
  }
}
