import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicWorkItemMapper } from './public.mappers';
import { Project } from '../../../projects/project.entity';
import { WorkItem } from '../work-item.entity';
import { WorkItemStatus } from '../work-item-status.enum';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async listOpenWorkItems(orgId: string, projectId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (
      !bipSettings ||
      bipSettings.isBuildInPublicEnabled === false ||
      bipSettings.isActiveWorkPagePublic === false
    ) {
      throw new NotFoundException();
    }

    const workItems = await this.workItemsRepository
      .createQueryBuilder('workItem')
      .leftJoinAndSelect('workItem.initiative', 'initiative')
      .leftJoinAndSelect('workItem.assignedTo', 'assignedTo')
      .where('workItem.orgId = :orgId', { orgId })
      .andWhere('workItem.projectId = :projectId', { projectId })
      .andWhere('workItem.status NOT IN (:closedStatus, :doneStatus)', {
        closedStatus: WorkItemStatus.CLOSED,
        doneStatus: WorkItemStatus.DONE,
      })
      .andWhere('workItem.cycleId IS NULL')
      .getMany();

    return Promise.all(workItems.map((wi) => PublicWorkItemMapper.toDto(wi)));
  }

  async getWorkItem(orgId: string, projectId: string, workItemId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new NotFoundException();
    }
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
      project: { id: projectId },
    });
    return PublicWorkItemMapper.toDto(workItem);
  }
}
