import { Injectable } from '@nestjs/common';
import { Objective, ObjectiveLevel } from './objective.entity';
import { In, IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgsService } from '../orgs/orgs.service';
import { KeyResult } from './key-result.entity';
import { KeyResultMapper, OKRMapper } from './mappers';
import { ObjectiveStatus } from './okrstatus.enum';
import { TimelineService } from '../common/timeline.service';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { User } from '../users/user.entity';
import { Timeline } from '../common/timeline.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateOrUpdateKeyResultDto,
  CreateOrUpdateOKRDto,
  ObjectiveDto,
  PatchKeyResultDto,
  UpdateObjectiveDto,
} from './dtos';

@Injectable()
export class OrgOkrsService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(Initiative)
    private featureRepository: Repository<Initiative>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private orgsService: OrgsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createObjective(orgId: string, objective: ObjectiveDto) {
    if (!objective.title) throw new Error('Objective title is required');

    const org = await this.orgsService.findOneById(orgId);
    if (!org) throw new Error('Organization not found');

    const newObjective = new Objective();
    newObjective.title = objective.title;
    newObjective.org = Promise.resolve(org);
    newObjective.level = ObjectiveLevel.ORGANIZATION;

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
    await this.objectiveRepository.save(newObjective);
    return this.objectiveRepository.findOneByOrFail({ id: newObjective.id });
  }

  async createKeyResultFor(objective: Objective, title: string) {
    if (!title) throw new Error('Key Result title is required');
    const keyResultEntity = new KeyResult();
    keyResultEntity.title = title;
    keyResultEntity.objective = Promise.resolve(objective);
    const objectiveOrg = await objective.org;
    keyResultEntity.org = Promise.resolve(objectiveOrg);
    keyResultEntity.project = Promise.resolve(await objective.project);
    const savedKeyResult = await this.keyResultRepository.save(keyResultEntity);
    this.eventEmitter.emit(
      'keyResult.created',
      await KeyResultMapper.toDTO(savedKeyResult),
    );
    return savedKeyResult;
  }

  async findObjectiveById(id: string) {
    return await this.objectiveRepository.findOneBy({ id });
  }

  async list(orgId: string) {
    const objectives = await this.objectiveRepository.findBy({
      org: { id: orgId },
      level: ObjectiveLevel.ORGANIZATION,
    });
    return await OKRMapper.toListDTO(objectives);
  }

  async get(orgId: any, id: string) {
    const { objective, keyResults } = await this.getObjectiveDetails(id, orgId);
    return await OKRMapper.toDTOWithComments(objective, keyResults);
  }

  async getObjectiveDetails(id: string, orgId: string) {
    const objective = await this.objectiveRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      level: ObjectiveLevel.ORGANIZATION,
    });
    const keyResults = await objective.keyResults;
    keyResults.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return { objective, keyResults };
  }

  async updateObjective(orgId: string, id: string, okrDto: UpdateObjectiveDto) {
    if (!okrDto.title) throw new Error('Objective title is required');
    if (
      !okrDto.status ||
      !Object.values(ObjectiveStatus).find((status) => status === okrDto.status)
    )
      throw new Error('Objective status is required');

    const objective = await this.objectiveRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      level: ObjectiveLevel.ORGANIZATION,
    });
    const originalObjective = await OKRMapper.toDTO(
      objective,
      await objective.keyResults,
    );

    objective.title = okrDto.title;
    objective.status = Object.values(ObjectiveStatus).find(
      (status) => status === okrDto.status,
    );

    // We need to update the timeline only if it's not 'past' and it's not the same as the current one (if it exists)
    if (okrDto.timeline && okrDto.timeline !== 'past') {
      TimelineService.validateTimeline(okrDto.timeline);
      const objectiveDates = TimelineService.getStartAndEndDatesByTimelineValue(
        okrDto.timeline,
      );
      objective.startDate = objectiveDates.startDate;
      objective.endDate = objectiveDates.endDate;
    } else if (
      okrDto.timeline !== 'past' &&
      objective.startDate &&
      objective.endDate
    ) {
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
    const updatedOkr = await OKRMapper.toDTO(
      savedObjective,
      await savedObjective.keyResults,
    );
    this.eventEmitter.emit('okr.updated', {
      previous: originalObjective,
      current: updatedOkr,
    });
    return updatedOkr;
  }

  async delete(orgId: string, id: string) {
    const okr = await this.get(orgId, id);
    const keyResults = await this.keyResultRepository.findBy({
      objective: { id, org: { id: orgId } },
    });
    for (const keyResult of keyResults) {
      this.eventEmitter.emit(
        'keyResult.deleted',
        await KeyResultMapper.toDTO(keyResult),
      );
    }
    await this.removeKeyResultsAssociations(orgId, id);
    await this.removeObjectiveAssociations(orgId, id);
    await this.keyResultRepository.delete({
      objective: { id, org: { id: orgId } },
    });
    await this.objectiveRepository.delete({
      id,
      org: { id: orgId },
    });
    this.eventEmitter.emit('okr.deleted', okr);
  }

  async create(orgId: string, okrDto: CreateOrUpdateOKRDto) {
    if (okrDto.objective.timeline) {
      TimelineService.validateTimeline(okrDto.objective.timeline);
    }
    const objective = await this.createObjective(orgId, okrDto.objective);
    if (!okrDto.keyResults || okrDto.keyResults.length === 0) {
      const savedOkr = await OKRMapper.toDTO(objective, []);
      this.eventEmitter.emit('okr.created', savedOkr);
      return savedOkr;
    }

    const keyResults = await Promise.all(
      okrDto.keyResults.map((keyResult) =>
        this.createKeyResultFor(objective, keyResult.title),
      ),
    );

    const savedOkr = await OKRMapper.toDTO(objective, keyResults);
    this.eventEmitter.emit('okr.created', savedOkr);
    return savedOkr;
  }

  async patchKeyResult(
    orgId: any,
    objectiveId: string,
    keyResultId: string,
    updateKeyResultDto: PatchKeyResultDto,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: {
        id: objectiveId,
        org: { id: orgId },
        level: ObjectiveLevel.ORGANIZATION,
      },
    });

    const originalKeyResult = await KeyResultMapper.toDTO(keyResult);

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
      keyResult.status = Object.values(ObjectiveStatus).find(
        (status) => status === updateKeyResultDto.status,
      );
    }

    const savedKeyResult = await this.keyResultRepository.save(keyResult);
    await this.updateObjectiveProgress(await keyResult.objective);
    const updatedKeyResult = await KeyResultMapper.toDTO(savedKeyResult);
    this.eventEmitter.emit('keyResult.updated', {
      previous: originalKeyResult,
      current: updatedKeyResult,
    });
    return updatedKeyResult;
  }

  async getKeyResultBy(id: string) {
    return await this.keyResultRepository.findOneByOrFail({ id });
  }

  async getKeyResultByOrgAndProject(orgId: string, id: string) {
    return await this.keyResultRepository.findOneByOrFail({
      id,
      org: { id: orgId },
    });
  }

  async getObjective(id: string) {
    return await this.objectiveRepository.findOneByOrFail({ id });
  }

  // TODO: Check if other entities should have the projectId as a parameter
  async listKeyResults(orgId: string) {
    const keyResults = await this.keyResultRepository.find({
      where: {
        org: { id: orgId },
        objective: { level: ObjectiveLevel.ORGANIZATION },
      },
      relations: ['initiatives', 'objective', 'org', 'initiatives.workItems'],
    });
    return await KeyResultMapper.toListDTO(keyResults);
  }

  async deleteKeyResult(
    orgId: string,
    objectiveId: string,
    keyResultId: string,
  ) {
    const keyResult = await this.getKeyResult(orgId, objectiveId, keyResultId);
    const originalKeyResult = await KeyResultMapper.toDTO(keyResult);

    await this.removeKeyResultAssociations(keyResultId);
    await this.keyResultRepository.delete({
      id: keyResultId,
      org: { id: orgId },
    });

    if (objectiveId) {
      await this.updateObjectiveProgress(
        await this.objectiveRepository.findOneBy({ id: objectiveId }),
      );
    }

    this.eventEmitter.emit('keyResult.deleted', originalKeyResult);
  }

  async updateKeyResult(
    orgId: string,
    objectiveId: string,
    keyResultId: string,
    updateKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: {
        id: objectiveId,
        org: { id: orgId },
        level: ObjectiveLevel.ORGANIZATION,
      },
    });
    this.validateCreateOrUpdateKeyResult(updateKeyResultDto);
    const originalKeyResult = await KeyResultMapper.toDTO(keyResult);

    keyResult.title = updateKeyResultDto.title;
    keyResult.progress = updateKeyResultDto.progress;
    keyResult.status = Object.values(ObjectiveStatus).find(
      (status) => status === updateKeyResultDto.status,
    );

    const savedKeyResult = await this.keyResultRepository.save(keyResult);
    await this.updateObjectiveProgress(await keyResult.objective);
    const updatedKeyResult = await KeyResultMapper.toDTO(savedKeyResult);
    this.eventEmitter.emit('keyResult.updated', {
      previous: originalKeyResult,
      current: updatedKeyResult,
    });
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
    keyResult.status = Object.values(ObjectiveStatus).find(
      (status) => status === createKeyResultDto.status,
    );
    keyResult.objective = Promise.resolve(objective);
    keyResult.org = Promise.resolve(await objective.org);
    await this.keyResultRepository.save(keyResult);
    const savedKeyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResult.id,
    });
    await this.updateObjectiveProgress(objective);
    const createdKeyResult = await KeyResultMapper.toDTO(savedKeyResult);
    this.eventEmitter.emit('keyResult.created', createdKeyResult);
    return createdKeyResult;
  }

  async getKeyResultDetail(
    orgId: string,
    objectiveId: string,
    keyResultId: string,
  ) {
    return await KeyResultMapper.toDtoWithComments(
      await this.getKeyResult(orgId, objectiveId, keyResultId),
    );
  }

  async getKeyResult(orgId: string, objectiveId: string, keyResultId: string) {
    return await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: {
        id: objectiveId,
        org: { id: orgId },
      },
    });
  }

  async listForTimeline(orgId: string, timeline: Timeline) {
    const objectives = await this.listObjectivesForTimeline(orgId, timeline);
    return await OKRMapper.toListDTO(objectives);
  }

  async listObjectivesForTimeline(
    orgId: string,
    timeline: Timeline,
  ): Promise<Objective[]> {
    if (timeline === Timeline.PAST) {
      return await this.listPastObjectives(orgId);
    }

    if (timeline == Timeline.LATER) {
      return await this.listLaterObjectives(orgId);
    }

    const { startDate, endDate } =
      TimelineService.getStartAndEndDatesByTimelineValue(timeline);
    return await this.objectiveRepository.find({
      where: {
        org: { id: orgId },
        level: ObjectiveLevel.ORGANIZATION,
        startDate,
        endDate,
      },
    });
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
      !Object.values(ObjectiveStatus).find(
        (status) => status === updateKeyResultDto.status,
      )
    )
      throw new Error('Key Result status is invalid');
  }

  private async listPastObjectives(orgId: string) {
    const { startDate } = TimelineService.calculateQuarterDates(
      TimelineService.getCurrentQuarter(),
    );
    return await this.objectiveRepository.find({
      where: {
        org: { id: orgId },
        level: ObjectiveLevel.ORGANIZATION,
        endDate: LessThan(startDate),
      },
    });
  }

  private async listLaterObjectives(orgId: string) {
    const { endDate } = TimelineService.calculateQuarterDates(
      TimelineService.getCurrentQuarter() + 1,
    );
    return await this.objectiveRepository.find({
      where: [
        {
          org: { id: orgId },
          level: ObjectiveLevel.ORGANIZATION,
          startDate: MoreThan(endDate),
        },
        {
          org: { id: orgId },
          level: ObjectiveLevel.ORGANIZATION,
          startDate: IsNull(),
          endDate: IsNull(),
        },
      ],
    });
  }

  async getStats(orgId: string, timeline: Timeline) {
    const objectives = await this.listObjectivesForTimeline(orgId, timeline);
    const keyResults = await this.keyResultRepository.find({
      where: {
        objective: {
          id: In(objectives.map((obj) => obj.id)),
        },
      },
    });

    const completedObjectives = objectives.filter(
      (obj) => obj.status === ObjectiveStatus.COMPLETED,
    );
    const inProgressObjectives = objectives.filter(
      (obj) =>
        obj.status !== ObjectiveStatus.COMPLETED &&
        obj.status !== ObjectiveStatus.CANCELED,
    );

    const completedKeyResults = keyResults.filter(
      (kr) => kr.status === ObjectiveStatus.COMPLETED,
    );
    const inProgressKeyResults = keyResults.filter(
      (kr) =>
        kr.status !== ObjectiveStatus.COMPLETED &&
        kr.status !== ObjectiveStatus.CANCELED,
    );

    const currentProgress =
      objectives.reduce((sum, obj) => sum + (obj.progress * 100 || 0), 0) /
      (objectives.length || 1);

    return {
      objectives: {
        total: objectives.length,
        completed: completedObjectives.length,
        inProgress: inProgressObjectives.length,
      },
      keyResults: {
        total: keyResults.length,
        completed: completedKeyResults.length,
        inProgress: inProgressKeyResults.length,
      },
      progress: {
        current: Math.round(currentProgress),
      },
    };
  }

  private async removeObjectiveAssociations(orgId: string, id: string) {
    await this.objectiveRepository.update(
      { parentObjective: { id }, org: { id: orgId } },
      { parentObjective: null },
    );
  }
}
