import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.entity';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Cycle } from '../../../cycles/cycle.entity';
import { CyclesService } from '../../../cycles/cycles.service';
import { Timeline } from '../../../common/timeline.enum';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';

@Injectable()
export class CyclesToolsService {
  constructor(
    @InjectRepository(Cycle)
    private cycleRepository: Repository<Cycle>,
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private cyclesService: CyclesService,
  ) {}

  getTools(orgId: string, projectId: string): DynamicStructuredTool[] {
    return [
      this.findOneCycle(orgId, projectId),
      this.listCycles(orgId, projectId),
      this.listCyclesForTimeline(orgId, projectId),
      this.getActiveCycle(orgId, projectId),
      this.listCycleWorkItems(orgId, projectId),
      this.getCycleProgress(orgId, projectId),
      this.confirmAndCreateCycle(orgId, projectId),
      this.confirmAndUpdateCycle(orgId, projectId),
      this.startCycle(orgId, projectId),
      this.completeCycle(orgId, projectId),
      this.findCycleByNamePattern(orgId, projectId),
    ];
  }

  private findOneCycle(orgId: string, projectId: string) {
    return tool(
      async ({ cycleId }) => {
        if (!cycleId) {
          return 'Please provide a cycle ID';
        }

        const findOptions = {
          id: cycleId,
          org: {
            id: orgId,
          },
          project: {
            id: projectId,
          },
        };

        try {
          const cycle = await this.cycleRepository.findOneOrFail({
            where: findOptions,
            relations: ['workItems'],
          });

          const workItems = await cycle.workItems;
          const workItemCount = workItems ? workItems.length : 0;
          const totalEstimation = workItems
            ? workItems.reduce((sum, item) => sum + (item.estimation || 0), 0)
            : 0;

          return `
              Title: ${cycle.title}
              Goal: ${cycle.goal || 'No goal defined'}
              Status: ${cycle.status}
              Start Date: ${cycle.startDate.toISOString().split('T')[0]}
              End Date: ${cycle.endDate.toISOString().split('T')[0]}
              Duration: ${cycle.duration} weeks
              ${
                cycle.actualStartDate
                  ? `Actual Start Date: ${
                      cycle.actualStartDate.toISOString().split('T')[0]
                    }`
                  : ''
              }
              ${
                cycle.actualEndDate
                  ? `Actual End Date: ${
                      cycle.actualEndDate.toISOString().split('T')[0]
                    }`
                  : ''
              }
              ${cycle.velocity ? `Velocity: ${cycle.velocity}` : ''}
              Work Items Count: ${workItemCount}
              Total Story Points: ${totalEstimation}
              ID: ${cycle.id}
              `;
        } catch (e) {
          return 'Failed to find the cycle';
        }
      },
      {
        name: 'find-one-cycle',
        description: 'Find a cycle in the system based on its ID.',
        schema: z.object({
          cycleId: z.string().describe('The cycle ID to search for'),
        }),
      },
    );
  }

  private listCycles(orgId: string, projectId: string) {
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

          const cycles = await this.cycleRepository.find({
            where: findOptions,
            order: { startDate: 'DESC' },
          });

          if (cycles.length === 0) {
            return 'No cycles found';
          }

          let output = 'Cycles:\n';
          for (const cycle of cycles) {
            const startDateStr = cycle.startDate.toISOString().split('T')[0];
            const endDateStr = cycle.endDate.toISOString().split('T')[0];

            output += `- ${cycle.title} (${startDateStr} to ${endDateStr}) - Status: ${cycle.status} - ID: ${cycle.id}\n`;
          }

          return output;
        } catch (e) {
          return 'Failed to list cycles';
        }
      },
      {
        name: 'list-cycles',
        description: 'List all cycles in the project.',
        schema: z.object({}),
      },
    );
  }

  private listCyclesForTimeline(orgId: string, projectId: string) {
    return tool(
      async ({ timeline }) => {
        try {
          const timelineEnum = timeline as Timeline;
          const cycles = await this.cyclesService.listForTimeline(
            orgId,
            projectId,
            timelineEnum,
          );

          if (cycles.length === 0) {
            return `No cycles found for timeline: ${timeline}`;
          }

          let output = `Cycles for ${timeline}:\n`;
          for (const cycle of cycles) {
            const startDateStr = new Date(cycle.startDate)
              .toISOString()
              .split('T')[0];
            const endDateStr = new Date(cycle.endDate)
              .toISOString()
              .split('T')[0];

            output += `- ${cycle.title} (${startDateStr} to ${endDateStr}) - Status: ${cycle.status} - ID: ${cycle.id}\n`;
          }

          return output;
        } catch (e) {
          return `Failed to list cycles for timeline: ${timeline}`;
        }
      },
      {
        name: 'list-cycles-for-timeline',
        description:
          'List cycles filtered by timeline (this-quarter, next-quarter, later, past).',
        schema: z.object({
          timeline: z
            .enum(['this-quarter', 'next-quarter', 'later', 'past'])
            .describe('The timeline to filter cycles by'),
        }),
      },
    );
  }

  private getActiveCycle(orgId: string, projectId: string) {
    return tool(
      async () => {
        try {
          const activeCycle = await this.cyclesService.getActiveCycle(
            orgId,
            projectId,
          );

          if (!activeCycle) {
            return 'No active cycle found';
          }

          const startDateStr = new Date(activeCycle.startDate)
            .toISOString()
            .split('T')[0];
          const endDateStr = new Date(activeCycle.endDate)
            .toISOString()
            .split('T')[0];

          return `
          Active Cycle: ${activeCycle.title}
          Goal: ${activeCycle.goal || 'No goal defined'}
          Start Date: ${startDateStr}
          End Date: ${endDateStr}
          Duration: ${activeCycle.duration} weeks
          ${
            activeCycle.actualStartDate
              ? `Actual Start Date: ${
                  new Date(activeCycle.actualStartDate)
                    .toISOString()
                    .split('T')[0]
                }`
              : ''
          }
          Days Remaining: ${this.calculateDaysRemaining(activeCycle)}
          ID: ${activeCycle.id}
          `;
        } catch (e) {
          return 'Failed to get active cycle';
        }
      },
      {
        name: 'get-active-cycle',
        description: 'Get the currently active cycle in the project.',
        schema: z.object({}),
      },
    );
  }

  private calculateDaysRemaining(cycle: any): number {
    const today = new Date();
    const endDate = new Date(cycle.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private listCycleWorkItems(orgId: string, projectId: string) {
    return tool(
      async ({ cycleId }) => {
        if (!cycleId) {
          return 'Please provide a cycle ID';
        }

        try {
          const findOptions = {
            id: cycleId,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          };

          const cycle = await this.cycleRepository.findOneOrFail({
            where: findOptions,
            relations: ['workItems', 'workItems.assignedTo'],
          });

          const workItems = await cycle.workItems;

          if (!workItems || workItems.length === 0) {
            return `Cycle "${cycle.title}" has no work items`;
          }

          let output = `Work items in cycle "${cycle.title}":\n`;
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
          return 'Failed to list cycle work items';
        }
      },
      {
        name: 'list-cycle-work-items',
        description: 'List all work items within a specific cycle.',
        schema: z.object({
          cycleId: z.string().describe('The cycle ID to get work items for'),
        }),
      },
    );
  }

  private getCycleProgress(orgId: string, projectId: string) {
    return tool(
      async ({ cycleId }) => {
        if (!cycleId) {
          return 'Please provide a cycle ID';
        }

        try {
          const findOptions = {
            id: cycleId,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          };

          const cycle = await this.cycleRepository.findOneOrFail({
            where: findOptions,
            relations: ['workItems'],
          });

          const workItems = await cycle.workItems;

          if (!workItems || workItems.length === 0) {
            return `Cycle "${cycle.title}" has no work items to track progress`;
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

          // Cycle timeline progress
          const timeProgress = this.calculateCycleTimeProgress(cycle);

          // Calculate burndown status
          const burndownStatus =
            pointProgressPercentage >= timeProgress
              ? 'On track'
              : 'Behind schedule';

          let output = `
          Cycle: ${cycle.title}
          Goal: ${cycle.goal || 'No goal defined'}
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
          return 'Failed to get cycle progress';
        }
      },
      {
        name: 'get-cycle-progress',
        description:
          'Get progress information for a cycle based on its work items.',
        schema: z.object({
          cycleId: z.string().describe('The cycle ID to get progress for'),
        }),
      },
    );
  }

  private calculateCycleTimeProgress(cycle: Cycle): number {
    const today = new Date();
    const startDate = cycle.actualStartDate || cycle.startDate;
    const endDate = cycle.endDate;

    // If cycle hasn't started yet
    if (today < startDate) return 0;

    // If cycle is already over
    if (today > endDate) return 100;

    // Calculate progress percentage
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();

    return Math.round((elapsedDuration / totalDuration) * 100);
  }

  private confirmAndCreateCycle(orgId: string, projectId: string) {
    return tool(
      async ({
        cycleGoal,
        cycleStartDate,
        cycleDuration,
        workItemReferences,
      }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });

          // Validate date format
          if (!/^\d{4}-\d{2}-\d{2}$/.test(cycleStartDate)) {
            return 'Start date must be in YYYY-MM-DD format';
          }

          // Validate duration
          if (!Number.isInteger(cycleDuration) || cycleDuration < 1) {
            return 'Duration must be a positive integer representing the number of weeks';
          }

          // Create the cycle first
          const savedCycle = await this.cyclesService.create(
            org.id,
            project.id,
            {
              goal: cycleGoal,
              startDate: cycleStartDate,
              duration: cycleDuration,
            },
          );

          // If work item references are provided, add them to the cycle
          let addedWorkItemsCount = 0;
          const failedWorkItemReferences = [];

          if (workItemReferences && workItemReferences.length > 0) {
            const cycle = await this.cycleRepository.findOneByOrFail({
              id: savedCycle.id,
            });

            for (const reference of workItemReferences) {
              try {
                // Find the work item
                const workItem = await this.workItemRepository.findOneByOrFail({
                  reference: reference,
                  org: { id: orgId },
                  project: { id: projectId },
                });

                // Associate the work item with the cycle
                workItem.cycle = Promise.resolve(cycle);

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
            workItemsMessage = `\n- Added ${addedWorkItemsCount} work items to the cycle`;
            if (failedWorkItemReferences.length > 0) {
              workItemsMessage += `\n- Failed to add the following work items: ${failedWorkItemReferences.join(', ')}`;
            }
          }

          return `Successfully created cycle\n
        Cycle Details\n
        - title: ${savedCycle.title}\n
        - goal: ${savedCycle.goal}\n
        - start date: ${new Date(savedCycle.startDate).toISOString().split('T')[0]}\n
        - end date: ${new Date(savedCycle.endDate).toISOString().split('T')[0]}\n
        - duration: ${savedCycle.duration} weeks\n
        - status: ${savedCycle.status}\n
        - id: ${savedCycle.id}${workItemsMessage}`;
        } catch (e) {
          return 'Failed to create cycle because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-create-cycle',
        description:
          'After the user explicitly approves a proposal in natural language, call this tool to create the cycle with optional work items.',
        schema: z.object({
          cycleGoal: z.string().describe('The cycle goal.'),
          cycleStartDate: z
            .string()
            .describe('The cycle start date in YYYY-MM-DD format.'),
          cycleDuration: z
            .number()
            .describe('The cycle duration in weeks (integer).'),
          workItemReferences: z
            .array(z.string())
            .optional()
            .describe(
              'Optional array of work item references (e.g., ["WI-123", "WI-124"]) to add to the cycle.',
            ),
        }),
      },
    );
  }

  private confirmAndUpdateCycle(orgId: string, projectId: string) {
    return tool(
      async ({ cycleId, cycleGoal, cycleStartDate, cycleDuration }) => {
        try {
          // Validate date format if provided
          if (cycleStartDate && !/^\d{4}-\d{2}-\d{2}$/.test(cycleStartDate)) {
            return 'Start date must be in YYYY-MM-DD format';
          }

          // Validate duration if provided
          if (
            cycleDuration !== undefined &&
            (!Number.isInteger(cycleDuration) || cycleDuration < 1)
          ) {
            return 'Duration must be a positive integer representing the number of weeks';
          }

          const updatedCycle = await this.cyclesService.update(
            orgId,
            projectId,
            cycleId,
            {
              goal: cycleGoal,
              startDate: cycleStartDate,
              duration: cycleDuration,
            },
          );

          return `Successfully updated cycle\n
          Cycle Details\n
          - title: ${updatedCycle.title}\n
          - goal: ${updatedCycle.goal}\n
          - start date: ${new Date(updatedCycle.startDate).toISOString().split('T')[0]}\n
          - end date: ${new Date(updatedCycle.endDate).toISOString().split('T')[0]}\n
          - duration: ${updatedCycle.duration} weeks\n
          - status: ${updatedCycle.status}\n
          - id: ${updatedCycle.id}`;
        } catch (e) {
          return 'Failed to update cycle because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-update-cycle',
        description:
          'After the user explicitly approves a cycle update in natural language, call this tool to update the cycle.',
        schema: z.object({
          cycleId: z.string().describe('The cycle ID to update'),
          cycleGoal: z.string().describe('The cycle goal.'),
          cycleStartDate: z
            .string()
            .optional()
            .describe('The cycle start date in YYYY-MM-DD format.'),
          cycleDuration: z
            .number()
            .optional()
            .describe('The cycle duration in weeks (integer).'),
        }),
      },
    );
  }

  private startCycle(orgId: string, projectId: string) {
    return tool(
      async ({ cycleId }) => {
        try {
          const cycle = await this.cyclesService.startCycle(
            orgId,
            projectId,
            cycleId,
          );

          return `
          Cycle "${cycle.title}" has been started successfully!
          
          Cycle Details:
          - Status: ${cycle.status}
          - Actual Start Date: ${new Date(cycle.actualStartDate).toISOString().split('T')[0]}
          - Projected End Date: ${new Date(cycle.endDate).toISOString().split('T')[0]}
          - Duration: ${cycle.duration} weeks
          
          Note: Any previously active cycle has been automatically completed.
          `;
        } catch (e) {
          return 'Failed to start cycle because ' + (e as any).message;
        }
      },
      {
        name: 'start-cycle',
        description: 'Start a cycle that is currently in PLANNED status.',
        schema: z.object({
          cycleId: z.string().describe('The ID of the cycle to start'),
        }),
      },
    );
  }

  private completeCycle(orgId: string, projectId: string) {
    return tool(
      async ({ cycleId }) => {
        try {
          const cycle = await this.cyclesService.completeCycle(
            orgId,
            projectId,
            cycleId,
          );

          return `
          Cycle "${cycle.title}" has been completed successfully!
          
          Cycle Details:
          - Status: ${cycle.status}
          - Start Date: ${new Date(cycle.startDate).toISOString().split('T')[0]}
          - Actual Start Date: ${cycle.actualStartDate ? new Date(cycle.actualStartDate).toISOString().split('T')[0] : 'N/A'}
          - Actual End Date: ${new Date(cycle.actualEndDate).toISOString().split('T')[0]}
          - Duration: ${cycle.duration} weeks
          - Velocity: ${cycle.velocity || 0} story points
          `;
        } catch (e) {
          return 'Failed to complete cycle because ' + (e as any).message;
        }
      },
      {
        name: 'complete-cycle',
        description: 'Complete a currently active cycle.',
        schema: z.object({
          cycleId: z.string().describe('The ID of the cycle to complete'),
        }),
      },
    );
  }

  private findCycleByNamePattern(orgId: string, projectId: string) {
    return tool(
      async ({ cycleNamePattern }) => {
        if (!cycleNamePattern) {
          return 'Please provide a cycle name pattern';
        }

        try {
          const matchingCycle = await this.cycleRepository
            .createQueryBuilder('cycle')
            .leftJoinAndSelect('cycle.workItems', 'workItems')
            .where('cycle.orgId = :orgId', { orgId })
            .andWhere('cycle.projectId = :projectId', { projectId })
            .andWhere('cycle.title ~* :pattern', {
              pattern: cycleNamePattern,
            })
            .orderBy('cycle.createdAt', 'DESC')
            .getOne();

          if (!matchingCycle) {
            return `No cycle found matching pattern "${cycleNamePattern}"`;
          }

          // Get associated work items
          const workItems = await matchingCycle.workItems;
          const workItemCount = workItems ? workItems.length : 0;
          const totalEstimation = workItems
            ? workItems.reduce((sum, item) => sum + (item.estimation || 0), 0)
            : 0;

          return `
            Title: ${matchingCycle.title}
            Goal: ${matchingCycle.goal || 'No goal defined'}
            Status: ${matchingCycle.status}
            Start Date: ${matchingCycle.startDate.toISOString().split('T')[0]}
            End Date: ${matchingCycle.endDate.toISOString().split('T')[0]}
            Duration: ${matchingCycle.duration} weeks
            ${
              matchingCycle.actualStartDate
                ? `Actual Start Date: ${
                    matchingCycle.actualStartDate.toISOString().split('T')[0]
                  }`
                : ''
            }
            ${
              matchingCycle.actualEndDate
                ? `Actual End Date: ${
                    matchingCycle.actualEndDate.toISOString().split('T')[0]
                  }`
                : ''
            }
            ${matchingCycle.velocity ? `Velocity: ${matchingCycle.velocity}` : ''}
            Work Items Count: ${workItemCount}
            Total Story Points: ${totalEstimation}
            ID: ${matchingCycle.id}
            `;
        } catch (e) {
          return 'Failed to find cycle with the specified pattern';
        }
      },
      {
        name: 'find-cycle-by-name-pattern',
        description:
          'Find a cycle by matching a pattern in its name (e.g., "CW33-CW35").',
        schema: z.object({
          cycleNamePattern: z
            .string()
            .describe('The pattern to match in cycle names, e.g., "CW33-CW35"'),
        }),
      },
    );
  }
}
