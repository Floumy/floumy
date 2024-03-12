import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkItemsStatusLog } from './work-items-status-log.entity';
import { Repository } from 'typeorm';
import { WorkItemStatus } from './work-item-status.enum';
import { WorkItemsStatusStats } from './work-items-status-stats.entity';
import { WorkItem } from './work-item.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkItemsEventHandler {
  constructor(
    @InjectRepository(WorkItemsStatusLog)
    private workItemsStatusLogRepository: Repository<WorkItemsStatusLog>,
    @InjectRepository(WorkItemsStatusStats)
    private workItemStatusRepository: Repository<WorkItemsStatusStats>,
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
  ) {}

  @OnEvent('workItem.created')
  async handleWorkItemCreated(event: WorkItem) {
    const workItemStatusStats = new WorkItemsStatusStats();
    workItemStatusStats.workItem = Promise.resolve(event);
    workItemStatusStats[WorkItemStatus[event.status]] = 0;
    const workItemStatusLog = new WorkItemsStatusLog();
    workItemStatusLog.workItemId = event.id;
    workItemStatusLog.status = event.status;
    workItemStatusLog.timestamp = event.createdAt;
    await this.workItemsStatusLogRepository.save(workItemStatusLog);
    await this.workItemStatusRepository.save(workItemStatusStats);
  }

  @OnEvent('workItem.deleted')
  async handleWorkItemDeleted(event: WorkItem) {
    await this.workItemStatusRepository.delete({ workItem: { id: event.id } });
    await this.workItemsStatusLogRepository.delete({ workItemId: event.id });
  }

  @OnEvent('workItem.updated')
  async handleWorkItemUpdated(event: WorkItem) {
    const previousStatusLog = await this.workItemsStatusLogRepository.findOne({
      where: { workItemId: event.id },
      order: { timestamp: 'DESC' },
    });
    const workItemStatusLog = new WorkItemsStatusLog();
    workItemStatusLog.workItemId = event.id;
    workItemStatusLog.status = event.status;
    workItemStatusLog.timestamp = event.updatedAt;
    await this.workItemsStatusLogRepository.save(workItemStatusLog);
    if (!previousStatusLog) {
      return;
    }
    const timeSpentInStatus =
      event.updatedAt.getTime() - previousStatusLog.timestamp.getTime();
    await this.updateWorkItemStatusStats(
      event.id,
      previousStatusLog.status,
      timeSpentInStatus,
    );
  }

  private async updateWorkItemStatusStats(
    workItemId: string,
    oldStatus: string,
    timeSpentInStatus: number,
  ) {
    let workItemStatusStats = await this.workItemStatusRepository.findOne({
      where: { workItem: { id: workItemId } },
    });
    if (!workItemStatusStats) {
      const workItem = await this.workItemsRepository.findOne({
        where: { id: workItemId },
      });
      workItemStatusStats = new WorkItemsStatusStats();
      workItemStatusStats.workItem = Promise.resolve(workItem);
      workItemStatusStats[oldStatus] = timeSpentInStatus;
      await this.workItemStatusRepository.save(workItemStatusStats);
    } else {
      // Kebab case to camel case
      const statusProperty = oldStatus.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase(),
      );
      workItemStatusStats[statusProperty] += timeSpentInStatus;
      await this.workItemStatusRepository.save(workItemStatusStats);
    }
  }
}
