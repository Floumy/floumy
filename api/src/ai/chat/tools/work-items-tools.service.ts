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
import { Sprint } from '../../../sprints/sprint.entity';

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
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
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

        try {
          const workItem =
            await this.workItemRepository.findOneByOrFail(findOptions);

          return `
              Title: ${workItem.title}
              Description: ${workItem.description}
              Estimation: ${workItem.estimation}
              Priority: ${workItem.priority}
              Type: ${workItem.type}
              Status: ${workItem.status}
              Reference: ${workItem.reference}
              `;
        } catch (e) {
          return 'Failed to find the work item';
        }
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
        workItemSprintId,
        workItemEstimation,
        workItemPriority,
        workItemStatus,
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

          type CreateWorkItemDto = {
            title: string;
            type: WorkItemType;
            description: string;
            status: WorkItemStatus;
            priority: Priority;
            estimation?: number;
            initiative?: string | number;
          };

          const createWorkItemDto: CreateWorkItemDto = {
            title: workItemTitle,
            type: workItemType as WorkItemType,
            description: workItemDescription,
            status: workItemStatus
              ? (workItemStatus as WorkItemStatus)
              : WorkItemStatus.PLANNED,
            priority: workItemPriority
              ? (workItemPriority as Priority)
              : Priority.MEDIUM,
          };

          if (workItemEstimation) {
            createWorkItemDto.estimation = workItemEstimation;
          }

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
            createWorkItemDto.initiative = initiative.id;
          }

          // Create the work item
          const savedWorkItem = await this.workItemsService.createWorkItem(
            org.id,
            project.id,
            user.id,
            createWorkItemDto,
          );

          // If a sprint ID is provided, associate the work item with the sprint
          let sprintAssociationMessage = '';
          if (workItemSprintId) {
            try {
              // Find the newly created work item
              const workItem = await this.workItemRepository.findOneByOrFail({
                id: savedWorkItem.id,
                org: { id: orgId },
                project: { id: projectId },
              });

              // Find the sprint
              const sprint = await this.sprintRepository.findOneByOrFail({
                id: workItemSprintId,
                org: { id: orgId },
                project: { id: projectId },
              });

              // Associate work item with sprint
              workItem.sprint = Promise.resolve(sprint);
              await this.workItemRepository.save(workItem);

              sprintAssociationMessage = `\n- Added to sprint: ${sprint.title}`;
            } catch (error) {
              sprintAssociationMessage = `\n- Failed to add to sprint: ${error.message}`;
            }
          }

          return `Successfully created work item with reference ${savedWorkItem.reference}\n
                Work Item Details\n
                - title: ${savedWorkItem.title}\n
                - type: ${savedWorkItem.type}\n
                - description: ${savedWorkItem.description}\n
                - status: ${savedWorkItem.status}\n
                - priority: ${savedWorkItem.priority}${
                  workItemEstimation
                    ? `\n- estimation: ${workItemEstimation}`
                    : ''
                }${sprintAssociationMessage}`;
        } catch (e) {
          return 'Failed to create work item: ' + e.message;
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
          workItemSprintId: z
            .string()
            .optional()
            .describe('Optional sprint ID to associate the work item with'),
          workItemEstimation: z
            .number()
            .optional()
            .describe('The numeric estimation for the work item'),
          workItemPriority: z
            .enum(['low', 'medium', 'high'])
            .optional()
            .describe(
              'One of the options low, medium, high. Defaults to medium if not provided.',
            ),
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
            .describe(
              'The initial status for the work item. Defaults to planned if not provided.',
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
        workItemSprintId,
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

          const updateWorkItemDto: any = {
            title: workItemTitle,
            type: workItemType as WorkItemType,
            description: workItemDescription,
            status: workItem.status,
            priority: workItem.priority,
          };

          if (workItemStatus) {
            updateWorkItemDto.status = workItemStatus as WorkItemStatus;
          }

          if (workItemPriority) {
            updateWorkItemDto.priority = workItemPriority as Priority;
          }

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
            updateWorkItemDto.initiative = initiative.id;
          }

          if (workItemEstimation !== undefined) {
            updateWorkItemDto.estimation = workItemEstimation;
          }

          const updatedWorkItem = await this.workItemsService.updateWorkItem(
            user.id,
            org.id,
            project.id,
            workItem.id,
            updateWorkItemDto,
          );

          // Handle sprint association changes
          let sprintMessage = '';
          if (workItemSprintId !== undefined) {
            try {
              const freshWorkItem =
                await this.workItemRepository.findOneByOrFail({
                  id: updatedWorkItem.id,
                });

              if (workItemSprintId === null) {
                // Remove work item from any sprint
                freshWorkItem.sprint = Promise.resolve(null);
                await this.workItemRepository.save(freshWorkItem);
                sprintMessage = '\n- Removed from sprint';
              } else {
                // Add to a specified sprint
                const sprint = await this.sprintRepository.findOneByOrFail({
                  id: workItemSprintId,
                  org: { id: orgId },
                  project: { id: projectId },
                });

                freshWorkItem.sprint = Promise.resolve(sprint);
                await this.workItemRepository.save(freshWorkItem);

                sprintMessage = `\n- Added to sprint: ${sprint.title}`;
              }
            } catch (error) {
              sprintMessage = `\n- Failed to update sprint association: ${error.message}`;
            }
          }

          return `Successfully updated work item ${updatedWorkItem.reference}\n
                Work Item Details\n
                - title: ${updatedWorkItem.title}\n
                - type: ${updatedWorkItem.type}\n
                - description: ${updatedWorkItem.description}\n
                - status: ${updatedWorkItem.status}\n
                - priority: ${updatedWorkItem.priority}${
                  updatedWorkItem.estimation
                    ? `\n- estimation: ${updatedWorkItem.estimation}`
                    : ''
                }${sprintMessage}`;
        } catch (e) {
          return 'Failed to update work item: ' + e.message;
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
            .optional()
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
          workItemSprintId: z
            .string()
            .nullable()
            .optional()
            .describe(
              'Optional sprint ID to associate the work item with. Set to null to remove from sprint.',
            ),
        }),
      },
    );
  }
}
