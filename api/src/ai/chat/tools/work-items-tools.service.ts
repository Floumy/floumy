import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.entity';
import { User } from '../../../users/user.entity';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { WorkItemsService } from '../../../backlog/work-items/work-items.service';
import { Priority } from '../../../common/priority.enum';
import { WorkItemStatus } from '../../../backlog/work-items/work-item-status.enum';
import { Initiative } from '../../../roadmap/initiatives/initiative.entity';
import { WorkItemType } from '../../../backlog/work-items/work-item-type.enum';

@Injectable()
export class WorkItemsToolsService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private workItemsService: WorkItemsService,
  ) {}

  getTools(orgId: string, projectId?: string, userId?: string) {
    const tools: DynamicStructuredTool[] = [
      this.findOneWorkItem(orgId, projectId),
    ];
    if (projectId && userId) {
      tools.push(this.confirmAndCreateWorkItem(orgId, projectId, userId));
      tools.push(this.confirmAndUpdateWorkItem(orgId, projectId, userId));
    }
    return tools;
  }

  private findOneWorkItem(orgId: string, projectId?: string) {
    return tool(
      async ({ workItemReference }) => {
        if (!workItemReference) {
          return 'Please provide a work item reference';
        }

        const findOptions = {
          reference: workItemReference,
          org: {
            id: orgId,
          },
          project: undefined,
        };

        if (projectId) {
          findOptions.project = {
            id: projectId,
          };
        }

        const workItem = await this.workItemRepository.findOneBy(findOptions);

        return `
              Title: ${workItem.title}
              Description: ${workItem.description}
              Estimation: ${workItem.estimation}
              Priority: ${workItem.priority}
              Type: ${workItem.type}
              Status: ${workItem.status}
              Reference: ${workItem.reference}
              `;
      },
      {
        name: 'find-one-work-item',
        description: 'Find a work item in the system based on its reference.',
        schema: z.object({
          workItemReference: z
            .string()
            .describe(
              'The work item reference to search for in the form of WI-123',
            ),
        }),
      },
    );
  }

  private confirmAndCreateWorkItem(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    return tool(
      async ({
        workItemTitle,
        workItemDescription,
        workItemType,
        workItemInitiative,
      }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });
          const user = await this.userRepository.findOneByOrFail({
            id: userId,
          });

          const createWorkItemDto = {
            title: workItemTitle,
            type: workItemType as WorkItemType,
            description: workItemDescription,
            status: WorkItemStatus.PLANNED,
            priority: Priority.MEDIUM,
          };

          if (workItemInitiative) {
            const initiative = await this.initiativeRepository.findOneByOrFail({
              reference: workItemInitiative,
              org: {
                id: orgId,
              },
              project: {
                id: projectId,
              },
            });
            createWorkItemDto['initiative'] = initiative.id;
          }

          const savedWorkItem = await this.workItemsService.createWorkItem(
            org.id,
            project.id,
            user.id,
            createWorkItemDto,
          );

          return `Successfully created work item with reference ${savedWorkItem.reference}\n
                  Work Item Details\n
                  - title: ${savedWorkItem.title}\n
                  - type: ${savedWorkItem.type}\n
                  - description: ${savedWorkItem.description}\n
                  - status: ${savedWorkItem.status}\n
                  - priority: ${savedWorkItem.priority}`;
        } catch (e) {
          return 'Failed to create work item because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-work-item',
        description:
          'After the user explicitly approves a proposal in natural language, call this tool to create the work item.',
        schema: z.object({
          workItemTitle: z.string().describe('The work item title.'),
          workItemDescription: z
            .string()
            .describe('The work item description.'),
          workItemType: z
            .enum(['user-story', 'task', 'bug', 'spike', 'technical-debt'])
            .describe(
              'One of the options user-story, task, bug, spike, technical-debt',
            ),
          workItemInitiative: z
            .string()
            .optional()
            .describe(
              'The initiative reference of the form I-123 that needs to be associated with the work item',
            ),
        }),
      },
    );
  }

  private confirmAndUpdateWorkItem(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    return tool(
      async ({
        workItemReference,
        workItemTitle,
        workItemDescription,
        workItemType,
        workItemInitiative,
        workItemStatus,
        workItemPriority,
        workItemEstimation,
      }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });
          const user = await this.userRepository.findOneByOrFail({
            id: userId,
          });

          const workItem = await this.workItemRepository.findOneByOrFail({
            reference: workItemReference,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          });

          const updateWorkItemDto = {
            title: workItemTitle,
            type: workItemType as WorkItemType,
            description: workItemDescription,
            status: workItemStatus as WorkItemStatus,
            priority: workItemPriority as Priority,
          };

          if (workItemInitiative) {
            const initiative = await this.initiativeRepository.findOneBy({
              reference: workItemInitiative,
              org: {
                id: orgId,
              },
              project: {
                id: projectId,
              },
            });
            updateWorkItemDto['initiative'] = initiative.id;
          }

          if (workItemEstimation) {
            updateWorkItemDto['estimation'] = workItemEstimation;
          }

          const updatedWorkItem = await this.workItemsService.updateWorkItem(
            user.id,
            org.id,
            project.id,
            workItem.id,
            updateWorkItemDto,
          );

          return `Successfully updated work item ${updatedWorkItem.reference}\n
                  Work Item Details\n
                  - title: ${updatedWorkItem.title}\n
                  - type: ${updatedWorkItem.type}\n
                  - description: ${updatedWorkItem.description}\n
                  - status: ${updatedWorkItem.status}\n
                  - priority: ${updatedWorkItem.priority}`;
        } catch (e) {
          return 'Failed to update work item because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-update-work-item',
        description:
          'After the user explicitly approves a work item update in natural language, call this tool to update the work item.',
        schema: z.object({
          workItemReference: z
            .string()
            .describe(
              'The work item reference to update in the form of WI-123',
            ),
          workItemTitle: z.string().describe('The work item title.'),
          workItemDescription: z
            .string()
            .describe('The work item description.'),
          workItemType: z
            .enum(['user-story', 'task', 'bug', 'spike', 'technical-debt'])
            .describe(
              'One of the options user-story, task, bug, spike, technical-debt',
            ),
          workItemPriority: z
            .enum(['low', 'medium', 'high'])
            .describe('One of the options low, medium, high'),
          workItemInitiative: z
            .string()
            .optional()
            .describe(
              'The initiative reference of the form I-123 that needs to be associated with the work item',
            ),
          workItemEstimation: z
            .number()
            .optional()
            .describe('The numeric estimation for the work item'),
          workItemStatus: z
            .enum([
              'planned',
              'ready-to-start',
              'in-progress',
              'blocked',
              'code-review',
              'testing',
              'revisions',
              'ready-for-deployment',
              'deployed',
              'done',
              'closed',
            ])
            .optional()
            .describe('The new status for the work item'),
        }),
      },
    );
  }
}
