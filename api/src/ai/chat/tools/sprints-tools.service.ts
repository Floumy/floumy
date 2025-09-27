import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.entity';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Sprint } from '../../../sprints/sprint.entity';
import { SprintsService } from '../../../sprints/sprints.service';
import { Timeline } from '../../../common/timeline.enum';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';

@Injectable()
export class SprintsToolsService {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private sprintsService: SprintsService,
  ) {}

  getTools(orgId: string, projectId: string): DynamicStructuredTool[] {
    return [
      this.findOneSprint(orgId, projectId),
      this.listSprints(orgId, projectId),
      this.listSprintsForTimeline(orgId, projectId),
      this.getActiveSprint(orgId, projectId),
      this.listSprintWorkItems(orgId, projectId),
      this.getSprintProgress(orgId, projectId),
      this.confirmAndCreateSprint(orgId, projectId),
      this.confirmAndUpdateSprint(orgId, projectId),
      this.startSprint(orgId, projectId),
      this.completeSprint(orgId, projectId),
      this.findSprintByNamePattern(orgId, projectId),
    ];
  }

  private findOneSprint(orgId: string, projectId: string) {
    return tool(
      async ({ sprintId }) => {
        if (!sprintId) {
          return 'Please provide a sprint ID';
        }

        const findOptions = {
          id: sprintId,
          org: {
            id: orgId,
          },
          project: {
            id: projectId,
          },
        };

        try {
          const sprint = await this.sprintRepository.findOneOrFail({
            where: findOptions,
            relations: ['workItems'],
          });

          const workItems = await sprint.workItems;
          const workItemCount = workItems ? workItems.length : 0;
          const totalEstimation = workItems
            ? workItems.reduce((sum, item) => sum + (item.estimation || 0), 0)
            : 0;

          return `
              Title: ${sprint.title}
              Goal: ${sprint.goal || 'No goal defined'}
              Status: ${sprint.status}
              Start Date: ${sprint.startDate.toISOString().split('T')[0]}
              End Date: ${sprint.endDate.toISOString().split('T')[0]}
              Duration: ${sprint.duration} weeks
              ${
                sprint.actualStartDate
                  ? `Actual Start Date: ${
                      sprint.actualStartDate.toISOString().split('T')[0]
                    }`
                  : ''
              }
              ${
                sprint.actualEndDate
                  ? `Actual End Date: ${
                      sprint.actualEndDate.toISOString().split('T')[0]
                    }`
                  : ''
              }
              ${sprint.velocity ? `Velocity: ${sprint.velocity}` : ''}
              Work Items Count: ${workItemCount}
              Total Story Points: ${totalEstimation}
              ID: ${sprint.id}
              `;
        } catch (e) {
          return 'Failed to find the sprint';
        }
      },
      {
        name: 'find-one-sprint',
        description: 'Find a sprint in the system based on its ID.',
        schema: z.object({
          sprintId: z.string().describe('The sprint ID to search for'),
        }),
      },
    );
  }

  private listSprints(orgId: string, projectId: string) {
    return tool(
      async () => {
        try {
          const findOptions = {
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          };

          const sprints = await this.sprintRepository.find({
            where: findOptions,
            order: { startDate: 'DESC' },
          });

          if (sprints.length === 0) {
            return 'No sprints found';
          }

          let output = 'Sprints:\n';
          for (const sprint of sprints) {
            const startDateStr = sprint.startDate.toISOString().split('T')[0];
            const endDateStr = sprint.endDate.toISOString().split('T')[0];

            output += `- ${sprint.title} (${startDateStr} to ${endDateStr}) - Status: ${sprint.status} - ID: ${sprint.id}\n`;
          }

          return output;
        } catch (e) {
          return 'Failed to list sprints';
        }
      },
      {
        name: 'list-sprints',
        description: 'List all sprints in the project.',
        schema: z.object({}),
      },
    );
  }

  private listSprintsForTimeline(orgId: string, projectId: string) {
    return tool(
      async ({ timeline }) => {
        try {
          const timelineEnum = timeline as Timeline;
          const sprints = await this.sprintsService.listForTimeline(
            orgId,
            projectId,
            timelineEnum,
          );

          if (sprints.length === 0) {
            return `No sprints found for timeline: ${timeline}`;
          }

          let output = `Sprints for ${timeline}:\n`;
          for (const sprint of sprints) {
            const startDateStr = new Date(sprint.startDate)
              .toISOString()
              .split('T')[0];
            const endDateStr = new Date(sprint.endDate)
              .toISOString()
              .split('T')[0];

            output += `- ${sprint.title} (${startDateStr} to ${endDateStr}) - Status: ${sprint.status} - ID: ${sprint.id}\n`;
          }

          return output;
        } catch (e) {
          return `Failed to list sprints for timeline: ${timeline}`;
        }
      },
      {
        name: 'list-sprints-for-timeline',
        description:
          'List sprints filtered by timeline (this-quarter, next-quarter, later, past).',
        schema: z.object({
          timeline: z
            .enum(['this-quarter', 'next-quarter', 'later', 'past'])
            .describe('The timeline to filter sprints by'),
        }),
      },
    );
  }

  private getActiveSprint(orgId: string, projectId: string) {
    return tool(
      async () => {
        try {
          const activeSprint = await this.sprintsService.getActiveSprint(
            orgId,
            projectId,
          );

          if (!activeSprint) {
            return 'No active sprint found';
          }

          const startDateStr = new Date(activeSprint.startDate)
            .toISOString()
            .split('T')[0];
          const endDateStr = new Date(activeSprint.endDate)
            .toISOString()
            .split('T')[0];

          return `
          Active Sprint: ${activeSprint.title}
          Goal: ${activeSprint.goal || 'No goal defined'}
          Start Date: ${startDateStr}
          End Date: ${endDateStr}
          Duration: ${activeSprint.duration} weeks
          ${
            activeSprint.actualStartDate
              ? `Actual Start Date: ${
                  new Date(activeSprint.actualStartDate)
                    .toISOString()
                    .split('T')[0]
                }`
              : ''
          }
          Days Remaining: ${this.calculateDaysRemaining(activeSprint)}
          ID: ${activeSprint.id}
          `;
        } catch (e) {
          return 'Failed to get active sprint';
        }
      },
      {
        name: 'get-active-sprint',
        description: 'Get the currently active sprint in the project.',
        schema: z.object({}),
      },
    );
  }

  private calculateDaysRemaining(sprint: any): number {
    const today = new Date();
    const endDate = new Date(sprint.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private listSprintWorkItems(orgId: string, projectId: string) {
    return tool(
      async ({ sprintId }) => {
        if (!sprintId) {
          return 'Please provide a sprint ID';
        }

        try {
          const findOptions = {
            id: sprintId,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          };

          const sprint = await this.sprintRepository.findOneOrFail({
            where: findOptions,
            relations: ['workItems', 'workItems.assignedTo'],
          });

          const workItems = await sprint.workItems;

          if (!workItems || workItems.length === 0) {
            return `Sprint "${sprint.title}" has no work items`;
          }

          let output = `Work items in sprint "${sprint.title}":\n`;
          let totalEstimation = 0;

          // Group by status
          const itemsByStatus = {};

          for (const workItem of workItems) {
            if (!itemsByStatus[workItem.status]) {
              itemsByStatus[workItem.status] = [];
            }
            itemsByStatus[workItem.status].push(workItem);
            totalEstimation += workItem.estimation || 0;
          }

          // Output by status groups
          for (const status in itemsByStatus) {
            output += `\n${status.toUpperCase()}:\n`;
            for (const workItem of itemsByStatus[status]) {
              const assignee = await workItem.assignedTo;
              const assigneeName = assignee ? assignee.name : 'Unassigned';
              output += `- ${workItem.reference}: ${workItem.title} (${workItem.type}, ${workItem.estimation || '?'} points) - ${assigneeName}\n`;
            }
          }

          output += `\nTotal Story Points: ${totalEstimation}`;

          return output;
        } catch (e) {
          return 'Failed to list sprint work items';
        }
      },
      {
        name: 'list-sprint-work-items',
        description: 'List all work items within a specific sprint.',
        schema: z.object({
          sprintId: z.string().describe('The sprint ID to get work items for'),
        }),
      },
    );
  }

  private getSprintProgress(orgId: string, projectId: string) {
    return tool(
      async ({ sprintId }) => {
        if (!sprintId) {
          return 'Please provide a sprint ID';
        }

        try {
          const findOptions = {
            id: sprintId,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          };

          const sprint = await this.sprintRepository.findOneOrFail({
            where: findOptions,
            relations: ['workItems'],
          });

          const workItems = await sprint.workItems;

          if (!workItems || workItems.length === 0) {
            return `Sprint "${sprint.title}" has no work items to track progress`;
          }

          const statusCounts = {};
          let completedCount = 0;
          let totalPoints = 0;
          let completedPoints = 0;

          // Analyze work item status and points
          for (const workItem of workItems) {
            if (!statusCounts[workItem.status]) {
              statusCounts[workItem.status] = 0;
            }
            statusCounts[workItem.status]++;

            const points = workItem.estimation || 0;
            totalPoints += points;

            if (workItem.status === 'done' || workItem.status === 'closed') {
              completedCount++;
              completedPoints += points;
            }
          }

          // Calculate overall progress
          const totalItems = workItems.length;
          const itemProgressPercentage = Math.round(
            (completedCount / totalItems) * 100,
          );
          const pointProgressPercentage =
            totalPoints > 0
              ? Math.round((completedPoints / totalPoints) * 100)
              : 0;

          // Sprint timeline progress
          const timeProgress = this.calculateSprintTimeProgress(sprint);

          // Calculate burndown status
          const burndownStatus =
            pointProgressPercentage >= timeProgress
              ? 'On track'
              : 'Behind schedule';

          let output = `
          Sprint: ${sprint.title}
          Goal: ${sprint.goal || 'No goal defined'}
          Timeline Progress: ${timeProgress}% complete
          
          Work Item Progress:
          - Items: ${completedCount}/${totalItems} complete (${itemProgressPercentage}%)
          - Story Points: ${completedPoints}/${totalPoints} complete (${pointProgressPercentage}%)
          - Burndown Status: ${burndownStatus}
          
          Work Item Status Breakdown:
          `;

          // Add status breakdown
          for (const status in statusCounts) {
            output += `- ${status}: ${statusCounts[status]}\n`;
          }

          return output;
        } catch (e) {
          return 'Failed to get sprint progress';
        }
      },
      {
        name: 'get-sprint-progress',
        description:
          'Get progress information for a sprint based on its work items.',
        schema: z.object({
          sprintId: z.string().describe('The sprint ID to get progress for'),
        }),
      },
    );
  }

  private calculateSprintTimeProgress(sprint: Sprint): number {
    const today = new Date();
    const startDate = sprint.actualStartDate || sprint.startDate;
    const endDate = sprint.endDate;

    // If sprint hasn't started yet
    if (today < startDate) return 0;

    // If sprint is already over
    if (today > endDate) return 100;

    // Calculate progress percentage
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();

    return Math.round((elapsedDuration / totalDuration) * 100);
  }

  private confirmAndCreateSprint(orgId: string, projectId: string) {
    return tool(
      async ({
        sprintGoal,
        sprintStartDate,
        sprintDuration,
        workItemReferences,
      }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });

          // Validate date format
          if (!/^\d{4}-\d{2}-\d{2}$/.test(sprintStartDate)) {
            return 'Start date must be in YYYY-MM-DD format';
          }

          // Validate duration
          if (!Number.isInteger(sprintDuration) || sprintDuration < 1) {
            return 'Duration must be a positive integer representing the number of weeks';
          }

          // Create the sprint first
          const savedSprint = await this.sprintsService.create(
            org.id,
            project.id,
            {
              goal: sprintGoal,
              startDate: sprintStartDate,
              duration: sprintDuration,
            },
          );

          // If work item references are provided, add them to the sprint
          let addedWorkItemsCount = 0;
          const failedWorkItemReferences = [];

          if (workItemReferences && workItemReferences.length > 0) {
            const sprint = await this.sprintRepository.findOneByOrFail({
              id: savedSprint.id,
            });

            for (const reference of workItemReferences) {
              try {
                // Find the work item
                const workItem = await this.workItemRepository.findOneByOrFail({
                  reference: reference,
                  org: { id: orgId },
                  project: { id: projectId },
                });

                // Associate the work item with the sprint
                workItem.sprint = Promise.resolve(sprint);

                // Save the work item
                await this.workItemRepository.save(workItem);
                addedWorkItemsCount++;
              } catch (error) {
                failedWorkItemReferences.push(reference);
              }
            }
          }

          let workItemsMessage = '';
          if (workItemReferences && workItemReferences.length > 0) {
            workItemsMessage = `\n- Added ${addedWorkItemsCount} work items to the sprint`;
            if (failedWorkItemReferences.length > 0) {
              workItemsMessage += `\n- Failed to add the following work items: ${failedWorkItemReferences.join(', ')}`;
            }
          }

          return `Successfully created sprint\n
        Sprint Details\n
        - title: ${savedSprint.title}\n
        - goal: ${savedSprint.goal}\n
        - start date: ${new Date(savedSprint.startDate).toISOString().split('T')[0]}\n
        - end date: ${new Date(savedSprint.endDate).toISOString().split('T')[0]}\n
        - duration: ${savedSprint.duration} weeks\n
        - status: ${savedSprint.status}\n
        - id: ${savedSprint.id}${workItemsMessage}`;
        } catch (e) {
          return 'Failed to create sprint because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-create-sprint',
        description:
          'After the user explicitly approves a proposal in natural language, call this tool to create the sprint with optional work items.',
        schema: z.object({
          sprintGoal: z.string().describe('The sprint goal.'),
          sprintStartDate: z
            .string()
            .describe('The sprint start date in YYYY-MM-DD format.'),
          sprintDuration: z
            .number()
            .describe('The sprint duration in weeks (integer).'),
          workItemReferences: z
            .array(z.string())
            .optional()
            .describe(
              'Optional array of work item references (e.g., ["WI-123", "WI-124"]) to add to the sprint.',
            ),
        }),
      },
    );
  }

  private confirmAndUpdateSprint(orgId: string, projectId: string) {
    return tool(
      async ({ sprintId, sprintGoal, sprintStartDate, sprintDuration }) => {
        try {
          // Validate date format if provided
          if (sprintStartDate && !/^\d{4}-\d{2}-\d{2}$/.test(sprintStartDate)) {
            return 'Start date must be in YYYY-MM-DD format';
          }

          // Validate duration if provided
          if (
            sprintDuration !== undefined &&
            (!Number.isInteger(sprintDuration) || sprintDuration < 1)
          ) {
            return 'Duration must be a positive integer representing the number of weeks';
          }

          const updatedSprint = await this.sprintsService.update(
            orgId,
            projectId,
            sprintId,
            {
              goal: sprintGoal,
              startDate: sprintStartDate,
              duration: sprintDuration,
            },
          );

          return `Successfully updated sprint\n
          Sprint Details\n
          - title: ${updatedSprint.title}\n
          - goal: ${updatedSprint.goal}\n
          - start date: ${new Date(updatedSprint.startDate).toISOString().split('T')[0]}\n
          - end date: ${new Date(updatedSprint.endDate).toISOString().split('T')[0]}\n
          - duration: ${updatedSprint.duration} weeks\n
          - status: ${updatedSprint.status}\n
          - id: ${updatedSprint.id}`;
        } catch (e) {
          return 'Failed to update sprint because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-update-sprint',
        description:
          'After the user explicitly approves a sprint update in natural language, call this tool to update the sprint.',
        schema: z.object({
          sprintId: z.string().describe('The sprint ID to update'),
          sprintGoal: z.string().describe('The sprint goal.'),
          sprintStartDate: z
            .string()
            .optional()
            .describe('The sprint start date in YYYY-MM-DD format.'),
          sprintDuration: z
            .number()
            .optional()
            .describe('The sprint duration in weeks (integer).'),
        }),
      },
    );
  }

  private startSprint(orgId: string, projectId: string) {
    return tool(
      async ({ sprintId }) => {
        try {
          const sprint = await this.sprintsService.startSprint(
            orgId,
            projectId,
            sprintId,
          );

          return `
          Sprint "${sprint.title}" has been started successfully!
          
          Sprint Details:
          - Status: ${sprint.status}
          - Actual Start Date: ${new Date(sprint.actualStartDate).toISOString().split('T')[0]}
          - Projected End Date: ${new Date(sprint.endDate).toISOString().split('T')[0]}
          - Duration: ${sprint.duration} weeks
          
          Note: Any previously active sprint has been automatically completed.
          `;
        } catch (e) {
          return 'Failed to start sprint because ' + (e as any).message;
        }
      },
      {
        name: 'start-sprint',
        description: 'Start a sprint that is currently in PLANNED status.',
        schema: z.object({
          sprintId: z.string().describe('The ID of the sprint to start'),
        }),
      },
    );
  }

  private completeSprint(orgId: string, projectId: string) {
    return tool(
      async ({ sprintId }) => {
        try {
          const sprint = await this.sprintsService.completeSprint(
            orgId,
            projectId,
            sprintId,
          );

          return `
          Sprint "${sprint.title}" has been completed successfully!
          
          Sprint Details:
          - Status: ${sprint.status}
          - Start Date: ${new Date(sprint.startDate).toISOString().split('T')[0]}
          - Actual Start Date: ${sprint.actualStartDate ? new Date(sprint.actualStartDate).toISOString().split('T')[0] : 'N/A'}
          - Actual End Date: ${new Date(sprint.actualEndDate).toISOString().split('T')[0]}
          - Duration: ${sprint.duration} weeks
          - Velocity: ${sprint.velocity || 0} story points
          `;
        } catch (e) {
          return 'Failed to complete sprint because ' + (e as any).message;
        }
      },
      {
        name: 'complete-sprint',
        description: 'Complete a currently active sprint.',
        schema: z.object({
          sprintId: z.string().describe('The ID of the sprint to complete'),
        }),
      },
    );
  }

  private findSprintByNamePattern(orgId: string, projectId: string) {
    return tool(
      async ({ sprintNamePattern }) => {
        if (!sprintNamePattern) {
          return 'Please provide a sprint name pattern';
        }

        try {
          const matchingSprint = await this.sprintRepository
            .createQueryBuilder('sprint')
            .leftJoinAndSelect('sprint.workItems', 'workItems')
            .where('sprint.orgId = :orgId', { orgId })
            .andWhere('sprint.projectId = :projectId', { projectId })
            .andWhere('sprint.title ~* :pattern', {
              pattern: sprintNamePattern,
            })
            .orderBy('sprint.createdAt', 'DESC')
            .getOne();

          if (!matchingSprint) {
            return `No sprint found matching pattern "${sprintNamePattern}"`;
          }

          // Get associated work items
          const workItems = await matchingSprint.workItems;
          const workItemCount = workItems ? workItems.length : 0;
          const totalEstimation = workItems
            ? workItems.reduce((sum, item) => sum + (item.estimation || 0), 0)
            : 0;

          return `
            Title: ${matchingSprint.title}
            Goal: ${matchingSprint.goal || 'No goal defined'}
            Status: ${matchingSprint.status}
            Start Date: ${matchingSprint.startDate.toISOString().split('T')[0]}
            End Date: ${matchingSprint.endDate.toISOString().split('T')[0]}
            Duration: ${matchingSprint.duration} weeks
            ${
              matchingSprint.actualStartDate
                ? `Actual Start Date: ${
                    matchingSprint.actualStartDate.toISOString().split('T')[0]
                  }`
                : ''
            }
            ${
              matchingSprint.actualEndDate
                ? `Actual End Date: ${
                    matchingSprint.actualEndDate.toISOString().split('T')[0]
                  }`
                : ''
            }
            ${matchingSprint.velocity ? `Velocity: ${matchingSprint.velocity}` : ''}
            Work Items Count: ${workItemCount}
            Total Story Points: ${totalEstimation}
            ID: ${matchingSprint.id}
            `;
        } catch (e) {
          return 'Failed to find sprint with the specified pattern';
        }
      },
      {
        name: 'find-sprint-by-name-pattern',
        description:
          'Find a sprint by matching a pattern in its name (e.g., "CW33-CW35").',
        schema: z.object({
          sprintNamePattern: z
            .string()
            .describe(
              'The pattern to match in sprint names, e.g., "CW33-CW35"',
            ),
        }),
      },
    );
  }
}
