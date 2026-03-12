import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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

  async listOpenWorkItems(
    orgId: string,
    projectId: string,
    includeRecentCompleted = false,
  ) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (
      project.cyclesEnabled === true ||
      !bipSettings ||
      bipSettings.isBuildInPublicEnabled === false ||
      bipSettings.isActiveWorkPagePublic === false
    ) {
      throw new NotFoundException();
    }

    const qb = this.workItemsRepository
      .createQueryBuilder('workItem')
      .leftJoinAndSelect('workItem.initiative', 'initiative')
      .leftJoinAndSelect('workItem.assignedTo', 'assignedTo')
      .where('workItem.orgId = :orgId', { orgId })
      .andWhere('workItem.projectId = :projectId', { projectId })
      .andWhere('workItem.cycleId IS NULL');

    if (includeRecentCompleted) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('workItem.status NOT IN (:closedStatus, :doneStatus)', {
              closedStatus: WorkItemStatus.CLOSED,
              doneStatus: WorkItemStatus.DONE,
            })
            .orWhere(
              'workItem.status IN (:closedStatus, :doneStatus) AND workItem.completedAt >= :oneMonthAgo',
              {
                closedStatus: WorkItemStatus.CLOSED,
                doneStatus: WorkItemStatus.DONE,
                oneMonthAgo,
              },
            );
        }),
      );
    } else {
      qb.andWhere('workItem.status NOT IN (:closedStatus, :doneStatus)', {
        closedStatus: WorkItemStatus.CLOSED,
        doneStatus: WorkItemStatus.DONE,
      });
    }

    const workItems = await qb.getMany();
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
