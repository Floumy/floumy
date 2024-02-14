import { Injectable } from "@nestjs/common";
import { CreateUpdateWorkItemDto, WorkItemPatchDto } from "./dtos";
import { InjectRepository } from "@nestjs/typeorm";
import { Feature } from "../../roadmap/features/feature.entity";
import { Repository } from "typeorm";
import { WorkItem } from "./work-item.entity";
import WorkItemMapper from "./work-item.mapper";
import { WorkItemStatus } from "./work-item-status.enum";
import { Iteration } from "../../iterations/Iteration.entity";
import { File } from "../../files/file.entity";
import { WorkItemFile } from "./work-item-file.entity";
import { User } from "../../users/user.entity";


@Injectable()
export class WorkItemsService {

  constructor(@InjectRepository(WorkItem) private workItemsRepository: Repository<WorkItem>,
              @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
              @InjectRepository(Iteration) private iterationsRepository: Repository<Iteration>,
              @InjectRepository(User) private usersRepository: Repository<User>,
              @InjectRepository(File) private filesRepository: Repository<File>,
              @InjectRepository(WorkItemFile) private workItemFilesRepository: Repository<WorkItemFile>) {
  }

  async createWorkItem(userId: string, workItemDto: CreateUpdateWorkItemDto) {
    if (!userId) throw new Error("User id is required");
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const org = await user.org;
    const workItem = new WorkItem();
    workItem.createdBy = Promise.resolve(user);
    await this.setWorkItemData(workItem, workItemDto, org.id);
    workItem.org = Promise.resolve(org);
    const savedWorkItem = await this.workItemsRepository.save(workItem);
    const feature = await savedWorkItem.feature;
    await this.updateFeatureProgress(feature);
    await this.setWorkItemsFiles(workItem, workItemDto, savedWorkItem);
    return WorkItemMapper.toDto(savedWorkItem);
  }

  private async setWorkItemsFiles(workItem: WorkItem, workItemDto: CreateUpdateWorkItemDto, savedWorkItem: WorkItem) {
    workItem.workItemFiles = Promise.resolve([]);
    await this.workItemFilesRepository.delete({ workItem: { id: workItem.id } });
    if (workItemDto.files && workItemDto.files.length > 0) {
      const files = await this.filesRepository.findBy(workItemDto.files);
      const workItemFiles = files.map(file => {
        const workItemFile = new WorkItemFile();
        workItemFile.file = Promise.resolve(file);  // Assign the file entity directly
        workItemFile.workItem = Promise.resolve(savedWorkItem); // Assign the workItem entity directly
        return workItemFile;
      });
      await this.workItemFilesRepository.save(workItemFiles);
      workItem.workItemFiles = Promise.resolve(workItemFiles);
    }
  }

  async listWorkItems(orgId: string) {
    const workItems = await this.workItemsRepository.find({ where: { org: { id: orgId } } });
    return await WorkItemMapper.toListDto(workItems);
  }

  async getWorkItem(orgId: string, id: string) {
    const workItem = await this.workItemsRepository.findOneByOrFail({ id, org: { id: orgId } });
    return WorkItemMapper.toDto(workItem);
  }

  async updateWorkItem(orgId: string, id: string, workItemDto: CreateUpdateWorkItemDto) {
    const workItem = await this.workItemsRepository.findOneByOrFail({ id, org: { id: orgId } });
    const oldFeature = await workItem.feature;
    await this.setWorkItemData(workItem, workItemDto, orgId);
    const savedWorkItem = await this.workItemsRepository.save(workItem);
    const newFeature = await savedWorkItem.feature;
    await this.updateFeatureProgress(oldFeature);
    if (newFeature && (!oldFeature || oldFeature.id !== newFeature.id)) {
      await this.updateFeatureProgress(newFeature);
    }
    await this.setWorkItemsFiles(workItem, workItemDto, savedWorkItem);
    return WorkItemMapper.toDto(savedWorkItem);
  }

  private async setWorkItemData(workItem: WorkItem, workItemDto: CreateUpdateWorkItemDto, orgId: string) {
    workItem.title = workItemDto.title;
    workItem.description = workItemDto.description;
    workItem.priority = workItemDto.priority;
    workItem.type = workItemDto.type;
    workItem.status = workItemDto.status;
    workItem.estimation = workItemDto.estimation;
    workItem.completedAt = null;
    if (workItemDto.status === WorkItemStatus.DONE || workItemDto.status === WorkItemStatus.CLOSED) {
      workItem.completedAt = new Date();
    }
    workItem.feature = Promise.resolve(null);
    workItem.iteration = Promise.resolve(null);
    if (workItemDto.feature) {
      const feature = await this.featuresRepository.findOneByOrFail({ id: workItemDto.feature, org: { id: orgId } });
      workItem.feature = Promise.resolve(feature);
    }
    if (workItemDto.iteration) {
      const iteration = await this.iterationsRepository.findOneByOrFail({
        id: workItemDto.iteration,
        org: { id: orgId }
      });
      workItem.iteration = Promise.resolve(iteration);
    }
  }

  async deleteWorkItem(orgId: string, id: string) {
    const workItem = await this.workItemsRepository.findOneByOrFail({ id, org: { id: orgId } });
    const feature = await workItem.feature;
    await this.workItemsRepository.remove(workItem);
    if (feature) {
      await this.updateFeatureProgress(feature);
    }
  }

  removeFeatureFromWorkItems(orgId: string, id: string) {
    return this.workItemsRepository.update({ org: { id: orgId }, feature: { id } }, { feature: null });
  }

  async listOpenWorkItemsWithoutIterations(orgId: string) {
    const workItems = await this.workItemsRepository
      .createQueryBuilder("workItem")
      .where("workItem.orgId = :orgId", { orgId })
      .andWhere("workItem.status NOT IN (:closedStatus, :doneStatus)",
        {
          closedStatus: WorkItemStatus.CLOSED,
          doneStatus: WorkItemStatus.DONE
        })
      .andWhere("workItem.iterationId IS NULL")
      .getMany();
    return await WorkItemMapper.toListDto(workItems);
  }

  private async updateFeatureProgress(feature: Feature) {
    if (!feature) return;

    const workItems = await feature.workItems;
    feature.workItemsCount = workItems.length;
    feature.progress = 0;
    await this.featuresRepository.save(feature);

    if (workItems.length > 0) {
      const completedWorkItems = workItems.filter(workItem => workItem.status === WorkItemStatus.DONE || workItem.status === WorkItemStatus.CLOSED);
      feature.progress = completedWorkItems.length / workItems.length * 100;
      await this.featuresRepository.save(feature);
    }
  }

  async patchWorkItem(orgId: string, workItemId: string, workItemPatchDto: WorkItemPatchDto) {
    const workItem = await this.workItemsRepository.findOneByOrFail({ id: workItemId, org: { id: orgId } });
    const currentIteration = await workItem.iteration;

    await this.updateIteration(workItem, workItemPatchDto, orgId, currentIteration);
    this.updateStatusAndCompletionDate(workItem, workItemPatchDto);
    this.updatePriority(workItem, workItemPatchDto);

    const savedWorkItem = await this.workItemsRepository.save(workItem);
    await this.updateFeatureProgress(await savedWorkItem.feature);
    return WorkItemMapper.toDto(savedWorkItem);
  }

  private async updateIteration(workItem: WorkItem, workItemPatchDto: WorkItemPatchDto, orgId: string, currentIteration: Iteration) {
    if (workItemPatchDto.iteration) {
      const iteration = await this.iterationsRepository.findOneByOrFail({
        id: workItemPatchDto.iteration,
        org: { id: orgId }
      });
      workItem.iteration = Promise.resolve(iteration);
    } else if (currentIteration != null && workItemPatchDto.iteration === null) {
      workItem.iteration = Promise.resolve(null);
    }
  }

  private updateStatusAndCompletionDate(workItem: WorkItem, workItemPatchDto: WorkItemPatchDto) {
    if (workItemPatchDto.status) {
      workItem.status = workItemPatchDto.status;
      workItem.completedAt = [WorkItemStatus.DONE, WorkItemStatus.CLOSED].includes(workItemPatchDto.status) ? new Date() : null;
    }
  }

  private updatePriority(workItem: WorkItem, workItemPatchDto: WorkItemPatchDto) {
    if (workItemPatchDto.priority) {
      workItem.priority = workItemPatchDto.priority;
    }
  }
}
