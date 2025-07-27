import { Injectable, Logger } from '@nestjs/common';
import { chunkText } from './chunk.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { DocumentVectorStoreService } from './document-vector-store.service';
import { Repository } from 'typeorm';
import { Initiative } from 'src/roadmap/initiatives/initiative.entity';
import { WorkItem } from 'src/backlog/work-items/work-item.entity';
import { Milestone } from 'src/roadmap/milestones/milestone.entity';
import { Sprint } from 'src/sprints/sprint.entity';
import { FeatureRequest } from 'src/feature-requests/feature-request.entity';
import { Issue } from 'src/issues/issue.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Page } from '../../pages/pages.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { User } from '../../users/user.entity';
import { Org } from '../../orgs/org.entity';
import { Project } from '../../projects/project.entity';

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);

  constructor(
    private documentVectorStore: DocumentVectorStoreService,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(FeatureRequest)
    private featureRequestRepository: Repository<FeatureRequest>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async indexEntities(orgId: string) {
    await this.indexOkrs(orgId);
    await this.indexInitiatives(orgId);
    await this.indexWorkItems(orgId);
    await this.indexMilestones(orgId);
    await this.indexSprints(orgId);
    await this.indexFeatureRequests(orgId);
    await this.indexIssues(orgId);
    await this.indexPages(orgId);
  }

  async indexOkrs(orgId: string) {
    const objectives = await this.objectiveRepository.find({
      where: { org: { id: orgId } },
      relations: ['keyResults'],
    });

    for (const objective of objectives) {
      const { assignedTo, org, project } = await this.indexObjective(objective);

      const keyResults = await objective.keyResults;
      for (const keyResult of keyResults) {
        await this.indexKeyResult(keyResult, assignedTo, org, project);
      }
    }
  }

  async indexKeyResult(
    keyResult: KeyResult,
    assignedTo: User,
    org: Org,
    project: Project,
  ) {
    const content = `
        Type: Key Result
        Title: ${keyResult.title}
        Progress: ${keyResult.progress || 0}%
        Status: ${keyResult.status}
        Reference: ${keyResult.reference || 'N/A'}
        Assignee: ${assignedTo?.name || 'N/A'}
        `;
    const krChunks = chunkText(content, 4000);
    for (let idx = 0; idx < krChunks.length; idx++) {
      await this.documentVectorStore.addDocument(krChunks[idx], {
        entityId: keyResult.id,
        userId: assignedTo?.id,
        orgId: org.id,
        projectId: project?.id,
        documentType: 'Key Result',
        chunkIndex: idx,
        totalChunks: krChunks.length,
      });
    }
  }

  async indexObjective(objective: Objective) {
    const assignedTo = await objective.assignedTo;
    const content = `
      Type: Objective
      Title: ${objective.title}
      Progress: ${objective.progress || 0}%
      Status: ${objective.status}
      Reference: ${objective.reference || 'N/A'}
      Assignee: ${assignedTo?.name || 'N/A'}
      `;

    const org = await objective.org;
    const project = await objective.project;
    const chunks = chunkText(content, 4000);
    for (let idx = 0; idx < chunks.length; idx++) {
      await this.documentVectorStore.addDocument(chunks[idx], {
        entityId: objective.id,
        userId: assignedTo?.id,
        orgId: org.id,
        projectId: project?.id,
        documentType: 'Objective',
        chunkIndex: idx,
        totalChunks: chunks.length,
      });
    }
    return { assignedTo, org, project };
  }

  async deleteEntityIndex(entityId: string) {
    await this.documentVectorStore.deleteAllDocumentsByEntityId(entityId);
  }

  async indexInitiatives(orgId: string) {
    const initiatives = await this.initiativeRepository.find({
      where: { org: { id: orgId } },
    });

    for (const initiative of initiatives) {
      const assignedTo = await initiative.assignedTo;
      const content = `
      Type: Initiative
      Title: ${initiative.title}
      Status: ${initiative.status}
      Reference: ${initiative.reference || 'N/A'}
      Assignee: ${assignedTo?.name || 'N/A'}
      Priority: ${initiative.priority}
      Description: ${initiative.description || 'N/A'}
      `;

      const org = await initiative.org;
      const project = await initiative.project;
      const chunks = chunkText(content, 4000);
      for (let idx = 0; idx < chunks.length; idx++) {
        await this.documentVectorStore.addDocument(chunks[idx], {
          entityId: initiative.id,
          userId: assignedTo?.id,
          orgId: org.id,
          projectId: project.id,
          documentType: 'Initiative',
          chunkIndex: idx,
          totalChunks: chunks.length,
        });
      }
    }
  }

  async indexWorkItems(orgId: string) {
    const workItems = await this.workItemRepository.find({
      where: { org: { id: orgId } },
    });
    for (const workItem of workItems) {
      const assignedTo = await workItem.assignedTo;
      const content = `
      Type: Work Item
      Title: ${workItem.title}
      Status: ${workItem.status}
      Reference: ${workItem.reference || 'N/A'}
      Assignee: ${assignedTo?.name || 'N/A'}
      Priority: ${workItem.priority}
      Description: ${workItem.description || 'N/A'}
      `;

      const org = await workItem.org;
      const project = await workItem.project;
      const chunks = chunkText(content, 4000);
      for (let idx = 0; idx < chunks.length; idx++) {
        await this.documentVectorStore.addDocument(chunks[idx], {
          entityId: workItem.id,
          userId: assignedTo?.id,
          orgId: org.id,
          projectId: project.id,
          documentType: 'Work Item',
          chunkIndex: idx,
          totalChunks: chunks.length,
        });
      }
    }
  }

  async indexMilestones(orgId: string) {
    const milestones = await this.milestoneRepository.find({
      where: { org: { id: orgId } },
    });
    for (const milestone of milestones) {
      const content = `
      Type: Milestone
      Title: ${milestone.title}
      Due Date: ${milestone.dueDate}
      `;

      const org = await milestone.org;
      const project = await milestone.project;
      const chunks = chunkText(content, 4000);
      for (let idx = 0; idx < chunks.length; idx++) {
        await this.documentVectorStore.addDocument(chunks[idx], {
          entityId: milestone.id,
          orgId: org.id,
          projectId: project.id,
          documentType: 'Milestone',
          chunkIndex: idx,
          totalChunks: chunks.length,
        });
      }
    }
  }

  async indexSprints(orgId: string) {
    const sprints = await this.sprintRepository.find({
      where: { org: { id: orgId } },
    });
    for (const sprint of sprints) {
      const content = `
      Type: Sprint
      Title: ${sprint.title}
      Start Date: ${sprint.startDate}
      End Date: ${sprint.endDate}
      `;

      const org = await sprint.org;
      const project = await sprint.project;
      const chunks = chunkText(content, 4000);
      for (let idx = 0; idx < chunks.length; idx++) {
        await this.documentVectorStore.addDocument(chunks[idx], {
          entityId: sprint.id,
          orgId: org.id,
          projectId: project.id,
          documentType: 'Sprint',
          chunkIndex: idx,
          totalChunks: chunks.length,
        });
      }
    }
  }

  async indexFeatureRequests(orgId: string) {
    const featureRequests = await this.featureRequestRepository.find({
      where: { org: { id: orgId } },
    });
    for (const featureRequest of featureRequests) {
      const content = `
      Type: Feature Request
      Title: ${featureRequest.title}
      Description: ${featureRequest.description || 'N/A'}
      Status: ${featureRequest.status}
      estimation: ${featureRequest.estimation || 'N/A'}
      votesCount: ${featureRequest.votesCount || 'N/A'}
      `;

      const org = await featureRequest.org;
      const project = await featureRequest.project;
      const chunks = chunkText(content, 4000);
      for (let idx = 0; idx < chunks.length; idx++) {
        await this.documentVectorStore.addDocument(chunks[idx], {
          entityId: featureRequest.id,
          orgId: org.id,
          projectId: project.id,
          documentType: 'Feature Request',
          chunkIndex: idx,
          totalChunks: chunks.length,
        });
      }
    }
  }

  async indexIssues(orgId: string) {
    const issues = await this.issueRepository.find({
      where: { org: { id: orgId } },
    });
    for (const issue of issues) {
      const content = `
      Type: Issue
      Title: ${issue.title}
      Description: ${issue.description || 'N/A'}
      Status: ${issue.status}
      priority: ${issue.priority}
      `;

      const org = await issue.org;
      const project = await issue.project;
      const chunks = chunkText(content, 4000);
      for (let idx = 0; idx < chunks.length; idx++) {
        await this.documentVectorStore.addDocument(chunks[idx], {
          entityId: issue.id,
          orgId: org.id,
          projectId: project.id,
          documentType: 'Issue',
          chunkIndex: idx,
          totalChunks: chunks.length,
        });
      }
    }
  }

  async indexPages(orgId: string) {
    const documents = await this.pageRepository.find({
      where: { project: { org: { id: orgId } } },
    });
    for (const document of documents) {
      const content = `
      Type: Document
      Title: ${document.title}
      Content: ${document.content || 'N/A'}
      `;

      const project = await document.project;
      const org = await project.org;
      const chunks = chunkText(content, 4000);
      for (let idx = 0; idx < chunks.length; idx++) {
        await this.documentVectorStore.addDocument(chunks[idx], {
          entityId: document.id,
          orgId: org.id,
          projectId: project.id,
          documentType: 'Document',
          chunkIndex: idx,
          totalChunks: chunks.length,
        });
      }
    }
  }

  async startIndexing(orgId: string) {
    const taskId = `indexing-${orgId}-${Date.now()}`;

    const job = setTimeout(async () => {
      try {
        await this.indexEntities(orgId);
      } catch (error) {
        this.logger.error(`Indexing failed for org ${orgId}:`, error);
      } finally {
        // Clean up the task after completion
        this.schedulerRegistry.deleteTimeout(taskId);
      }
    }, 0);

    this.schedulerRegistry.addTimeout(taskId, job);
    return taskId;
  }

  async cancelIndexing(taskId: string): Promise<boolean> {
    try {
      const job = this.schedulerRegistry.getTimeout(taskId);
      this.schedulerRegistry.deleteTimeout(taskId);
      clearTimeout(job);
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel indexing task ${taskId}:`, error);
      return false;
    }
  }

  async updateObjectiveIndex(objective: Objective) {
    await this.deleteEntityIndex(objective.id);
    await this.indexObjective(objective);
  }
}
