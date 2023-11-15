import { Injectable } from "@nestjs/common";
import { Objective } from "./objective.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OrgsService } from "../orgs/orgs.service";
import { KeyResult } from "./key-result.entity";
import { OKRMapper } from "./mappers";

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
    const objectives = await this.objectiveRepository.findBy({ org: { id: orgId } });
    return OKRMapper.toListDTO(objectives);
  }

  async get(orgId: any, id: string) {
    const objective = await this.objectiveRepository.findOneByOrFail({ id, org: { id: orgId } });
    const keyResults = await objective.keyResults;
    return OKRMapper.toDTO(objective, keyResults);
  }

  async update(orgId: string, id: string, okrDto: CreateOrUpdateOKRDto) {
    await this.objectiveRepository.update(
      { id, org: { id: orgId } },
      { title: okrDto.objective.title, description: okrDto.objective.description }
    );
    if (!okrDto.keyResults || okrDto.keyResults.length === 0) return;
    await this.updateKeyResults(id, okrDto.keyResults);
  }

  async delete(orgId: string, id: string) {
    await this.keyResultRepository.delete({ objective: { id, org: { id: orgId } } });
    await this.objectiveRepository.delete({ id, org: { id: orgId } });
  }

  async create(orgId: string, okrDto: CreateOrUpdateOKRDto) {
    const objective = await this.createObjective(orgId, okrDto.objective.title, okrDto.objective.description);
    if (!okrDto.keyResults || okrDto.keyResults.length === 0) return { objective, keyResults: [] };

    const keyResults = await Promise.all(okrDto.keyResults.map(keyResult => this.createKeyResult(objective, keyResult.title)));

    return { objective, keyResults };
  }

  private async updateKeyResults(id: string, keyResults: { id?: string, title: string }[]) {
    const objective = await this.objectiveRepository.findOneByOrFail({ id });
    const notEmptyKeyResults = keyResults
      .filter(keyResult =>
        keyResult.title.replace(/\s+/g, "").length > 0);
    const existingKeyResults = await objective.keyResults;
    await this.deleteKeyResultsThatAreNotInTheList(existingKeyResults, notEmptyKeyResults);
    await this.updateOrCreateKeyResults(objective, notEmptyKeyResults);
  }

  private async updateOrCreateKeyResults(objective: Objective, keyResults: { id?: string; title: string }[]) {
    for (const keyResult of keyResults) {
      if (keyResult.id) {
        await this.keyResultRepository.update({ id: keyResult.id }, { title: keyResult.title });
      } else {
        await this.createKeyResult(objective, keyResult.title);
      }
    }
  }

  private async deleteKeyResultsThatAreNotInTheList(existingKeyResults: KeyResult[], keyResults: { id?: string; title: string }[]) {
    for (const existingKeyResult of existingKeyResults) {
      if (!keyResults.find(keyResult => keyResult.id === existingKeyResult.id)) {
        await this.keyResultRepository.delete({ id: existingKeyResult.id });
      }
    }
  }
}
