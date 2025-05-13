import { Injectable } from '@nestjs/common';
import { CreateDemoDto } from './dtos';
import { OkrsService } from '../okrs/okrs.service';
import { ObjectiveStatus } from '../okrs/okrstatus.enum';
import { InitiativesService } from '../roadmap/initiatives/initiatives.service';
import { InitiativeStatus } from '../roadmap/initiatives/initiativestatus.enum';
import { Priority } from '../common/priority.enum';
import { WorkItemsService } from '../backlog/work-items/work-items.service';
import { WorkItemStatus } from '../backlog/work-items/work-item-status.enum';
import { WorkItemType } from '../backlog/work-items/work-item-type.enum';
import { Timeline } from '../common/timeline.enum';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { InjectRepository } from '@nestjs/typeorm';

const fakeEstimationPoints = [2, 3, 5, 8, 13];

@Injectable()
export class DemoService {
  constructor(
    private okrService: OkrsService,
    private initiativeService: InitiativesService,
    private workItemService: WorkItemsService,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
  ) {}

  async create(
    userId: string,
    orgId: string,
    projectId: string,
    demoDto: CreateDemoDto,
  ) {
    for (const objective of demoDto.objectives) {
      const createdObjective = await this.okrService.create(orgId, projectId, {
        objective: {
          title: objective.title,
          timeline: Timeline.THIS_QUARTER,
        },
      });
      for (const keyResult of objective.keyResults) {
        const createdKeyResult = await this.okrService.createKeyResult(
          orgId,
          createdObjective.objective.id,
          {
            title: keyResult.title,
            status: ObjectiveStatus.ON_TRACK,
            progress: 0,
          },
        );
        for (const initiative of keyResult.initiatives) {
          const createdInitiative =
            await this.initiativeService.createInitiative(
              orgId,
              projectId,
              userId,
              {
                title: initiative.title,
                status: InitiativeStatus.READY_TO_START,
                priority: initiative.priority as Priority,
                description: initiative.description,
                keyResult: createdKeyResult.id,
              },
            );
          for (const workItem of initiative.workItems) {
            await this.workItemService.createWorkItem(
              orgId,
              projectId,
              userId,
              {
                title: workItem.title,
                priority: workItem.priority as Priority,
                description: workItem.description,
                type: workItem.type as WorkItemType,
                initiative: createdInitiative.id,
                status: WorkItemStatus.PLANNED,
                estimation:
                  fakeEstimationPoints[
                    Math.floor(Math.random() * fakeEstimationPoints.length)
                  ],
              },
            );
          }
        }
      }
    }
  }

  async complete(orgId: string) {
    const org = await this.orgRepository.findOneOrFail({
      where: { id: orgId },
    });
    org.hadDemo = true;
    await this.orgRepository.save(org);
  }
}
