import { Injectable } from "@nestjs/common";
import { Objective } from "./objective.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OrgsService } from "../orgs/orgs.service";
import { KeyResult } from "./key-result.entity";
import { KeyResultMapper, OKRMapper } from "./mappers";
import { OKRStatus } from "./OKRStatus.enum";

@Injectable()
export class OkrsService {

  constructor(@InjectRepository(Objective)
              private objectiveRepository: Repository<Objective>,
              @InjectRepository(KeyResult)
              private keyResultRepository: Repository<KeyResult>,
              private orgsService: OrgsService) {
  }

  async createObjective(orgId: string, title: string) {
    if (!title) throw new Error("Objective title is required");
    const org = await this.orgsService.findOneById(orgId);
    if (!org) throw new Error("Organization not found");
    const objectiveEntity = new Objective();
    objectiveEntity.title = title;
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
    return OKRMapper.toDTO(objective, keyResults.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
  }

  async update(orgId: string, id: string, okrDto: CreateOrUpdateOKRDto) {
    await this.objectiveRepository.update(
      { id, org: { id: orgId } },
      { title: okrDto.objective.title }
    );
    if (okrDto.keyResults && okrDto.keyResults.length > 0) {
      await this.updateKeyResults(id, okrDto.keyResults);
    }
    await this.updateObjectiveProgress(await this.objectiveRepository.findOneByOrFail({ id }));
  }

  async delete(orgId: string, id: string) {
    await this.keyResultRepository.delete({ objective: { id, org: { id: orgId } } });
    await this.objectiveRepository.delete({ id, org: { id: orgId } });
  }

  async create(orgId: string, okrDto: CreateOrUpdateOKRDto) {
    const objective = await this.createObjective(orgId, okrDto.objective.title);
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

  private async updateObjectiveProgress(objective: Objective) {
    const keyResults = await objective.keyResults;
    objective.progress = keyResults.reduce((acc, keyResult) => acc + keyResult.progress, 0) / keyResults.length;
    await this.objectiveRepository.save(objective);
  }

  async patchKeyResult(orgId: any, objectiveId: string, keyResultId: string, updateKeyResultDto: PatchKeyResultDto) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({ id: keyResultId, objective: { id: objectiveId, org: { id: orgId } } });
    if (updateKeyResultDto.progress) {
      keyResult.progress = updateKeyResultDto.progress;
      const savedKeyResult = await this.keyResultRepository.save(keyResult);
      await this.updateObjectiveProgress(await keyResult.objective);
      return KeyResultMapper.toDTO(savedKeyResult);
    }

    if (updateKeyResultDto.status) {
      keyResult.status = Object.values(OKRStatus).find(status => status === updateKeyResultDto.status);
      const savedKeyResult = await this.keyResultRepository.save(keyResult);
      return KeyResultMapper.toDTO(savedKeyResult);
    }

    throw new Error("Invalid patch key result dto");
  }

  async getKeyResult(id: string) {
    return await this.keyResultRepository.findOneByOrFail({ id });
  }

  async getObjective(id: string) {
    return await this.objectiveRepository.findOneByOrFail({ id });
  }

  async patchObjective(orgId: any, objectiveId: string, updateObjectiveDto: PatchObjectiveDto) {
    const status = Object.values(OKRStatus).find(status => status === updateObjectiveDto.status);
    return await this.objectiveRepository.update(
      { id: objectiveId, org: { id: orgId } },
      { status }
    );
  }
}
