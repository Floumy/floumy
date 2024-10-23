import { Injectable } from '@nestjs/common';
import { Objective } from './objective.entity';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgsService } from '../orgs/orgs.service';
import { KeyResult } from './key-result.entity';
import { KeyResultMapper, OKRMapper } from './mappers';
import { OKRStatus } from './okrstatus.enum';
import { TimelineService } from '../common/timeline.service';
import { Feature } from '../roadmap/features/feature.entity';
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
import { Product } from '../products/product.entity';

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
    private eventEmitter: EventEmitter2,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  async createObjective(
    orgId: string,
    productId: string,
    objective: ObjectiveDto,
  ) {
    if (!objective.title) throw new Error('Objective title is required');

    const org = await this.orgsService.findOneById(orgId);
    if (!org) throw new Error('Organization not found');

    const product = await this.productsRepository.findOneByOrFail({
      id: productId,
    });

    const newObjective = new Objective();
    newObjective.title = objective.title;
    newObjective.org = Promise.resolve(org);
    newObjective.product = Promise.resolve(product);

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
    keyResultEntity.org = Promise.resolve(await objective.org);
    keyResultEntity.product = Promise.resolve(await objective.product);
    return await this.keyResultRepository.save(keyResultEntity);
  }

  async findObjectiveById(id: string) {
    return await this.objectiveRepository.findOneBy({ id });
  }

  async list(orgId: string, productId: string) {
    const objectives = await this.objectiveRepository.findBy({
      org: { id: orgId },
      product: { id: productId },
    });
    return await OKRMapper.toListDTO(objectives);
  }

  async get(orgId: any, productId: string, id: string) {
    const { objective, keyResults } = await this.getObjectiveDetails(
      id,
      orgId,
      productId,
    );
    return await OKRMapper.toDTOWithComments(objective, keyResults);
  }

  async getObjectiveDetails(id: string, orgId: string, productId: string) {
    const objective = await this.objectiveRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      product: { id: productId },
    });
    const keyResults = await objective.keyResults;
    keyResults.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return { objective, keyResults };
  }

  async updateObjective(
    orgId: string,
    productId: string,
    id: string,
    okrDto: UpdateObjectiveDto,
  ) {
    if (!okrDto.title) throw new Error('Objective title is required');
    if (
      !okrDto.status ||
      !Object.values(OKRStatus).find((status) => status === okrDto.status)
    )
      throw new Error('Objective status is required');

    const objective = await this.objectiveRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      product: { id: productId },
    });
    const originalObjective = await OKRMapper.toDTO(
      objective,
      await objective.keyResults,
    );

    objective.title = okrDto.title;
    objective.status = Object.values(OKRStatus).find(
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

  async delete(orgId: string, productId: string, id: string) {
    const okr = await this.get(orgId, productId, id);
    await this.removeKeyResultsAssociations(orgId, id);
    await this.keyResultRepository.delete({
      objective: { id, org: { id: orgId }, product: { id: productId } },
    });
    await this.objectiveRepository.delete({
      id,
      org: { id: orgId },
      product: { id: productId },
    });
    this.eventEmitter.emit('okr.deleted', okr);
  }

  async create(orgId: string, productId: string, okrDto: CreateOrUpdateOKRDto) {
    if (okrDto.objective.timeline) {
      TimelineService.validateTimeline(okrDto.objective.timeline);
    }
    const objective = await this.createObjective(
      orgId,
      productId,
      okrDto.objective,
    );
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
    productId: string,
    objectiveId: string,
    keyResultId: string,
    updateKeyResultDto: PatchKeyResultDto,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: {
        id: objectiveId,
        org: { id: orgId },
        product: { id: productId },
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
      keyResult.status = Object.values(OKRStatus).find(
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

  async getKeyResultByOrgAndProduct(
    orgId: string,
    productId: string,
    id: string,
  ) {
    return await this.keyResultRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      product: { id: productId },
    });
  }

  async getObjective(id: string) {
    return await this.objectiveRepository.findOneByOrFail({ id });
  }

  async listKeyResults(orgId: string) {
    const keyResults = await this.keyResultRepository.find({
      where: { org: { id: orgId } },
      relations: ['features', 'objective', 'org', 'features.workItems'],
    });
    return await KeyResultMapper.toListDTO(keyResults);
  }

  async deleteKeyResult(
    orgId: string,
    productId: string,
    objectiveId: string,
    keyResultId: string,
  ) {
    const keyResult = await this.getKeyResult(
      orgId,
      productId,
      objectiveId,
      keyResultId,
    );
    const originalKeyResult = await KeyResultMapper.toDTO(keyResult);

    await this.removeKeyResultAssociations(keyResultId);
    await this.keyResultRepository.delete({
      id: keyResultId,
      objective: { id: objectiveId, org: { id: orgId } },
    });
    await this.updateObjectiveProgress(
      await this.objectiveRepository.findOneBy({ id: objectiveId }),
    );

    this.eventEmitter.emit('keyResult.deleted', originalKeyResult);
  }

  async updateKeyResult(
    orgId: string,
    porductId: string,
    objectiveId: string,
    keyResultId: string,
    updateKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: {
        id: objectiveId,
        org: { id: orgId },
        product: { id: porductId },
      },
    });
    this.validateCreateOrUpdateKeyResult(updateKeyResultDto);
    const originalKeyResult = await KeyResultMapper.toDTO(keyResult);

    keyResult.title = updateKeyResultDto.title;
    keyResult.progress = updateKeyResultDto.progress;
    keyResult.status = Object.values(OKRStatus).find(
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
    keyResult.status = Object.values(OKRStatus).find(
      (status) => status === createKeyResultDto.status,
    );
    keyResult.objective = Promise.resolve(objective);
    keyResult.org = Promise.resolve(await objective.org);
    keyResult.product = Promise.resolve(await objective.product);
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
    productId: string,
    objectiveId: string,
    keyResultId: string,
  ) {
    return await KeyResultMapper.toDtoWithComments(
      await this.getKeyResult(orgId, productId, objectiveId, keyResultId),
    );
  }

  async getKeyResult(
    orgId: string,
    productId,
    objectiveId: string,
    keyResultId: string,
  ) {
    return await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      objective: {
        id: objectiveId,
        org: { id: orgId },
        product: { id: productId },
      },
    });
  }

  async listForTimeline(orgId: string, productId: string, timeline: Timeline) {
    const objectives = await this.listObjectivesForTimeline(
      orgId,
      productId,
      timeline,
    );
    return await OKRMapper.toListDTO(objectives);
  }

  async listObjectivesForTimeline(
    orgId: string,
    productId: string,
    timeline: Timeline,
  ): Promise<Objective[]> {
    if (timeline === Timeline.PAST) {
      return await this.listPastObjectives(orgId, productId);
    }

    if (timeline == Timeline.LATER) {
      return await this.listLaterObjectives(orgId, productId);
    }

    const { startDate, endDate } =
      TimelineService.getStartAndEndDatesByTimelineValue(timeline);
    return await this.objectiveRepository.find({
      where: {
        org: { id: orgId },
        product: { id: productId },
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
      !Object.values(OKRStatus).find(
        (status) => status === updateKeyResultDto.status,
      )
    )
      throw new Error('Key Result status is invalid');
  }

  private async listPastObjectives(orgId: string, productId: string) {
    const { startDate } = TimelineService.calculateQuarterDates(
      TimelineService.getCurrentQuarter(),
    );
    return await this.objectiveRepository.find({
      where: {
        org: { id: orgId },
        product: { id: productId },
        endDate: LessThan(startDate),
      },
    });
  }

  private async listLaterObjectives(orgId: string, productId: string) {
    const { endDate } = TimelineService.calculateQuarterDates(
      TimelineService.getCurrentQuarter() + 1,
    );
    return await this.objectiveRepository.find({
      where: [
        {
          org: { id: orgId },
          product: { id: productId },
          startDate: MoreThan(endDate),
        },
        {
          org: { id: orgId },
          product: { id: productId },
          startDate: IsNull(),
          endDate: IsNull(),
        },
      ],
    });
  }
}
