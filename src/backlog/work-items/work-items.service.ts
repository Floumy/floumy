import { Injectable } from "@nestjs/common";
import { CreateUpdateWorkItemDto } from "./dtos";
import { InjectRepository } from "@nestjs/typeorm";
import { Feature } from "../../roadmap/features/feature.entity";
import { Repository } from "typeorm";
import { WorkItem } from "./work-item.entity";
import WorkItemMapper from "./work-item.mapper";
import { Org } from "../../orgs/org.entity";

@Injectable()
export class WorkItemsService {

  constructor(@InjectRepository(WorkItem) private workItemsRepository: Repository<WorkItem>,
              @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
              @InjectRepository(Org) private orgsRepository: Repository<Org>) {
  }

  async createWorkItem(orgId: string, workItemDto: CreateUpdateWorkItemDto) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const workItem = new WorkItem();
    workItem.title = workItemDto.title;
    workItem.description = workItemDto.description;
    workItem.priority = workItemDto.priority;
    workItem.type = workItemDto.type;
    if (workItemDto.feature) {
      const feature = await this.featuresRepository.findOneByOrFail({ id: workItemDto.feature, org: { id: orgId } });
      workItem.feature = Promise.resolve(feature);
    }
    workItem.org = Promise.resolve(org);
    return WorkItemMapper.toDto(await this.workItemsRepository.save(workItem));
  }

  async listWorkItems(orgId: string) {
    const workItems = await this.workItemsRepository.find({ where: { org: { id: orgId } } });
    return await WorkItemMapper.toListDto(workItems);
  }

  async getWorkItem(orgId: string, id: string) {
    const workItem = await this.workItemsRepository.findOneByOrFail({ id, org: { id: orgId } });
    return WorkItemMapper.toDto(workItem);
  }
}
