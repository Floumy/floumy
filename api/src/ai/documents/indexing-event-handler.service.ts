import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InitiativeDto, KeyResultDto, OKRDto } from '../../okrs/dtos';
import { IndexingService } from './indexing.service';
import { Repository } from 'typeorm';
import { Objective } from '../../okrs/objective.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyResult } from '../../okrs/key-result.entity';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { WorkItemDto } from '../../backlog/work-items/dtos';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { RequestDto } from '../../requests/dtos';
import { Request } from '../../requests/request.entity';
import { Issue } from '../../issues/issue.entity';

@Injectable()
export class IndexingEventHandlerService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    private indexingService: IndexingService,
  ) {}

  @OnEvent('okr.created')
  async handleObjectiveCreate(event: OKRDto) {
    const objective = await this.objectiveRepository.findOneBy({
      id: event.objective.id,
    });
    if (objective) {
      await this.indexingService.indexObjective(objective);
    }
  }

  @OnEvent('okr.updated')
  async handleObjectiveUpdate(event: { previous: OKRDto; current: OKRDto }) {
    const objective = await this.objectiveRepository.findOneBy({
      id: event.current.objective.id,
    });
    if (objective) {
      await this.indexingService.updateObjectiveIndex(objective);
    }
  }

  @OnEvent('okr.deleted')
  async handleObjectiveDeleted(event: OKRDto) {
    await this.indexingService.deleteEntityIndex(event.objective.id);
  }

  @OnEvent('keyResult.created')
  async handleKeyResultCreated(event: KeyResultDto) {
    const keyResult = await this.keyResultRepository.findOneBy({
      id: event.id,
    });

    if (keyResult) {
      await this.indexingService.indexKeyResult(keyResult);
    }
  }

  @OnEvent('keyResult.updated')
  async handleKeyResultUpdated(event: {
    previous: KeyResultDto;
    current: KeyResultDto;
  }) {
    const keyResult = await this.keyResultRepository.findOneBy({
      id: event.current.id,
    });

    if (keyResult) {
      await this.indexingService.updateKeyResultIndex(keyResult);
    }
  }

  @OnEvent('keyResult.deleted')
  async handleKeyResultDeleted(event: KeyResultDto) {
    await this.indexingService.deleteEntityIndex(event.id);
  }

  @OnEvent('initiative.created')
  async handleInitiativeCreated(event: InitiativeDto) {
    const initiative = await this.initiativeRepository.findOneBy({
      id: event.id,
    });

    if (initiative) {
      await this.indexingService.indexInitiative(initiative);
    }
  }

  @OnEvent('initiative.updated')
  async handleInitiativeUpdated(event: {
    previous: InitiativeDto;
    current: InitiativeDto;
  }) {
    const initiative = await this.initiativeRepository.findOneBy({
      id: event.current.id,
    });

    if (initiative) {
      await this.indexingService.updateInitiativeIndex(initiative);
    }
  }

  @OnEvent('initiative.deleted')
  async handleInitiativeDeleted(event: InitiativeDto) {
    await this.indexingService.deleteEntityIndex(event.id);
  }

  @OnEvent('workItem.created')
  async handleWorkItemCreated(event: WorkItemDto) {
    const workItem = await this.workItemRepository.findOneBy({
      id: event.id,
    });

    if (workItem) {
      await this.indexingService.indexWorkItem(workItem);
    }
  }

  @OnEvent('workItem.updated')
  async handleWorkItemUpdated(event: {
    previous: WorkItemDto;
    current: WorkItemDto;
  }) {
    const workItem = await this.workItemRepository.findOneBy({
      id: event.current.id,
    });

    if (workItem) {
      await this.indexingService.updateWorkItemIndex(workItem);
    }
  }

  @OnEvent('workItem.deleted')
  async handleWorkItemDeleted(event: WorkItemDto) {
    await this.indexingService.deleteEntityIndex(event.id);
  }

  @OnEvent('request.created')
  async handleRequestCreated(event: RequestDto) {
    const request = await this.requestRepository.findOneBy({
      id: event.id,
    });

    if (request) {
      await this.indexingService.indexRequest(request);
    }
  }

  @OnEvent('request.updated')
  async handleRequestUpdated(event: {
    previous: RequestDto;
    current: RequestDto;
  }) {
    const request = await this.requestRepository.findOneBy({
      id: event.current.id,
    });

    if (request) {
      await this.indexingService.updateRequestIndex(request);
    }
  }

  @OnEvent('request.deleted')
  async handleRequestDeleted(event: RequestDto) {
    await this.indexingService.deleteEntityIndex(event.id);
  }

  @OnEvent('issue.created')
  async handleIssueCreated(event: { id: string }) {
    const issue = await this.issueRepository.findOneBy({
      id: event.id,
    });

    if (issue) {
      await this.indexingService.indexIssue(issue);
    }
  }

  @OnEvent('issue.updated')
  async handleIssueUpdated(event: {
    previous: { id: string };
    current: { id: string };
  }) {
    const issue = await this.issueRepository.findOneBy({
      id: event.current.id,
    });

    if (issue) {
      await this.indexingService.updateIssueIndex(issue);
    }
  }

  @OnEvent('issue.deleted')
  async handleIssueDeleted(event: { id: string }) {
    await this.indexingService.deleteEntityIndex(event.id);
  }
}
