import { Injectable } from '@nestjs/common';
import { Objective } from './objective.entity';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgsService } from '../orgs/orgs.service';
import { KeyResult } from './key-result.entity';
import { KeyResultMapper, OKRMapper } from './mappers';
import { OKRStatus } from './okrstatus.enum';
import { TimelineService } from '../common/timeline.service';
import { Feature } from '../roadmap/features/feature.entity';
import { User } from '../users/user.entity';
import { Timeline } from '../common/timeline.enum';

@Injectable()
export class OkrsService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(Feature)
    private featureRepository: Repository<Feature>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private orgsService: OrgsService,
  ) {}

  async createObjective(orgId: string, objective: ObjectiveDto) {
    if (!objective.title) throw new Error('Objective title is required');

    const org = await this.orgsService.findOneById(orgId);
    if (!org) throw new Error('Organization not found');
    const newObjective = new Objective();
    newObjective.title = objective.title;
    newObjective.org = Promise.resolve(org);
    if (objective.timeline) {
      TimelineService.validateTimeline(objective.timeline);
      const { startDate, endDate } =
        TimelineService.getStartAndEndDatesByTimelineValue(objective.timeline);
      newObjective.startDate = startDate;
      newObjective.endDate = endDate;
    }
    if (objective.assignedTo) {
      newObjective.assignedTo = Promise.resolve(
        await this.usersRepository.findOneByOrFail({
          id: objective.assignedTo,
          org: { id: orgId },
        }),
      );
    }
    return await this.objectiveRepository.save(newObjective);
  }

  async createKeyResultFor(objective: Objective, title: string) {
    if (!title) throw new Error('Key Result title is required');
    const keyResultEntity = new KeyResult();
    keyResultEntity.title = title;
    keyResultEntity.objective = Promise.resolve(objective);
    keyResultEntity.org = Promise.resolve(await objective.org);
    return await this.keyResultRepository.save(keyResultEntity);
  }

  async findObjectiveById(id: string) {
    return await this.objectiveRepository.findOneBy({ id });
  }

  async list(orgId: string) {
    const objectives = await this.objectiveRepository.findBy({
      org: { id: orgId },
    });
    return await OKRMapper.toListDTO(objectives);
  }

  async get(orgId: any, id: string) {
    const objective = await this.objectiveRepository.findOneByOrFail({
      id,
      org: { id: orgId },
    });
    const keyResults = await objective.keyResults;
    return await OKRMapper.toDTO(
      objective,
      keyResults.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    );
  }

  async updateObjective(orgId: string, id: string, okrDto: UpdateObjectiveDto) {
    if (!okrDto.title) throw new Error('Objective title is required');
    if (!okrDto.status) throw new Error('Obj');
    const objective = await this.objectiveRepository.findOneByOrFail({
      id,
      org: { id: orgId },
    });

    objective.title = okrDto.title;

    if (okrDto.timeline) {
      TimelineService.validateTimeline(okrDto.timeline);
      const objectiveDates = TimelineService.getStartAndEndDatesByTimelineValue(
        okrDto.timeline,
      );
      objective.startDate = objectiveDates.startDate;
      objective.endDate = objectiveDates.endDate;
    } else if (objective.startDate && objective.endDate) {
      objective.startDate = null;
      objective.endDate = null;
    }

    const assignedTo = await objective.assignedTo;
    if (okrDto.assignedTo) {
      const assignedToUser = await this.usersRepository.findOneByOrFail({
        id: okrDto.assignedTo,
        org: { id: orgId },
      });
      objective.assignedTo = Promise.resolve(assignedToUser);
    } else if (assignedTo) {
      objective.assignedTo = Promise.resolve(null);
    }

    const savedObjective = await this.objectiveRepository.save(objective);
    return OKRMapper.toDTO(savedObjective, await savedObjective.keyResults);
  }

  async delete(orgId: string, id: string) {
    await this.removeKeyResultsAssociations(orgId, id);
    await this.keyResultRepository.delete({
      objective: { id, org: { id: orgId } },
    });
    await this.objectiveRepository.delete({ id, org: { id: orgId } });
  }

  async create(orgId: string, okrDto: CreateOrUpdateOKRDto) {
    if (okrDto.objective.timeline) {
      TimelineService.validateTimeline(okrDto.objective.timeline);
    }
    const objective = await this.createObjective(orgId, okrDto.objective);
    if (!okrDto.keyResults || okrDto.keyResults.length === 0)
      return await OKRMapper.toDTO(objective, []);

    const keyResults = await Promise.all(
      okrDto.keyResults.map((keyResult) =>
        this.createKeyResultFor(objective, keyResult.title),
      ),
    );

    return await OKRMapper.toDTO(objective, keyResults);
  }

  private async updateObjectiveProgress(objective: Objective) {
    const keyResults = await objective.keyResults;
    if (keyResults.length === 0) {
      objective.progress = 0;
    } else {
      objective.progress =
        keyResults.reduce((acc, keyResult) => acc + keyResult.progress, 0) /
        keyResults.length;
    }
    await this.objectiveRepository.save(objective);
  }

  async patchKeyResult(
    orgId: any,
    objectiveId: string,
    keyResultId: string,
    updateKeyResultDto: PatchKeyResultDto,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: { id: objectiveId, org: { id: orgId } },
    });

    if (updateKeyResultDto.title) {
      keyResult.title = updateKeyResultDto.title;
    }

    if (
      updateKeyResultDto.progress !== undefined &&
      updateKeyResultDto.progress !== null
    ) {
      keyResult.progress = updateKeyResultDto.progress;
    }

    if (updateKeyResultDto.status) {
      keyResult.status = Object.values(OKRStatus).find(
        (status) => status === updateKeyResultDto.status,
      );
    }

    const savedKeyResult = await this.keyResultRepository.save(keyResult);
    await this.updateObjectiveProgress(await keyResult.objective);
    return await KeyResultMapper.toDTO(savedKeyResult);
  }

  async getKeyResultBy(id: string) {
    return await this.keyResultRepository.findOneByOrFail({ id });
  }

  async getKeyResultByOrgId(orgId: string, id: string) {
    return await this.keyResultRepository.findOneByOrFail({
      id,
      org: { id: orgId },
    });
  }

  async getObjective(id: string) {
    return await this.objectiveRepository.findOneByOrFail({ id });
  }

  async listKeyResults(orgId: string) {
    const keyResults = await this.keyResultRepository.findBy({
      org: { id: orgId },
    });
    return await KeyResultMapper.toListDTO(keyResults);
  }

  private async removeKeyResultsAssociations(orgId: string, id: string) {
    const keyResults = await this.keyResultRepository.findBy({
      objective: { id, org: { id: orgId } },
    });
    for (const keyResult of keyResults) {
      await this.removeKeyResultAssociations(keyResult.id);
    }
  }

  private async removeKeyResultAssociations(id: string) {
    await this.featureRepository.update(
      { keyResult: { id } },
      { keyResult: null },
    );
  }

  async deleteKeyResult(
    orgId: string,
    objectiveId: string,
    keyResultId: string,
  ) {
    await this.removeKeyResultAssociations(keyResultId);
    await this.keyResultRepository.delete({
      id: keyResultId,
      objective: { id: objectiveId, org: { id: orgId } },
    });
    await this.updateObjectiveProgress(
      await this.objectiveRepository.findOneBy({ id: objectiveId }),
    );
  }

  async updateKeyResult(
    orgId: string,
    objectiveId: string,
    keyResultId: string,
    updateKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: { id: objectiveId, org: { id: orgId } },
    });

    this.validateCreateOrUpdateKeyResult(updateKeyResultDto);

    keyResult.title = updateKeyResultDto.title;
    keyResult.progress = updateKeyResultDto.progress;
    keyResult.status = Object.values(OKRStatus).find(
      (status) => status === updateKeyResultDto.status,
    );

    const savedKeyResult = await this.keyResultRepository.save(keyResult);
    await this.updateObjectiveProgress(await keyResult.objective);
    return await KeyResultMapper.toDTO(savedKeyResult);
  }

  private validateCreateOrUpdateKeyResult(
    updateKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    if (!updateKeyResultDto.title)
      throw new Error('Key Result title is required');
    if (
      updateKeyResultDto.progress === undefined ||
      updateKeyResultDto.progress === null
    )
      throw new Error('Key Result progress is required');
    if (!updateKeyResultDto.status)
      throw new Error('Key Result status is required');
    if (
      !Object.values(OKRStatus).find(
        (status) => status === updateKeyResultDto.status,
      )
    )
      throw new Error('Key Result status is invalid');
  }

  async createKeyResult(
    orgId: string,
    objectiveId: string,
    createKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    const objective = await this.objectiveRepository.findOneByOrFail({
      id: objectiveId,
      org: { id: orgId },
    });
    this.validateCreateOrUpdateKeyResult(createKeyResultDto);
    const keyResult = new KeyResult();
    keyResult.title = createKeyResultDto.title;
    keyResult.progress = createKeyResultDto.progress;
    keyResult.status = Object.values(OKRStatus).find(
      (status) => status === createKeyResultDto.status,
    );
    keyResult.objective = Promise.resolve(objective);
    keyResult.org = Promise.resolve(await objective.org);
    const savedKeyResult = await this.keyResultRepository.save(keyResult);
    await this.updateObjectiveProgress(objective);
    return await KeyResultMapper.toDTO(savedKeyResult);
  }

  async getKeyResult(orgId: string, objectiveId: string, keyResultId: string) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: { id: objectiveId, org: { id: orgId } },
    });
    return await KeyResultMapper.toDTO(keyResult);
  }

  async listForTimeline(orgId: string, timeline: Timeline) {
    if (timeline === Timeline.PAST) {
      return await this.listPastObjectives(orgId);
    }
    const { startDate, endDate } =
      TimelineService.getStartAndEndDatesByTimelineValue(timeline);
    const objectives = await this.objectiveRepository.find({
      where: { org: { id: orgId }, startDate, endDate },
    });
    return await OKRMapper.toListDTO(objectives);
  }

  private async listPastObjectives(orgId: string) {
    const { startDate } = TimelineService.calculateQuarterDates(
      TimelineService.getCurrentQuarter(),
    );
    const objectives = await this.objectiveRepository.find({
      where: { org: { id: orgId }, endDate: LessThan(startDate) },
    });
    return await OKRMapper.toListDTO(objectives);
  }
}
