import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Like, Repository } from 'typeorm';
import { Project } from '../../../projects/project.entity';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Milestone } from '../../../roadmap/milestones/milestone.entity';
import { MilestonesService } from '../../../roadmap/milestones/milestones.service';
import { Timeline } from '../../../common/timeline.enum';
import { Initiative } from '../../../roadmap/initiatives/initiative.entity';

@Injectable()
export class MilestonesToolsService {
  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private milestonesService: MilestonesService,
  ) {}

  getTools(orgId: string, projectId: string): DynamicStructuredTool[] {
    return [
      this.findOneMilestone(orgId, projectId),
      this.findOneMilestoneByTitle(orgId, projectId),
      this.listMilestones(orgId, projectId),
      this.listMilestoneInitiatives(orgId, projectId),
      this.listMilestonesForTimeline(orgId, projectId),
      this.getMilestoneProgress(orgId, projectId),
      this.confirmAndCreateMilestone(orgId, projectId),
      this.confirmAndUpdateMilestone(orgId, projectId),
      this.addInitiativeToMilestone(orgId, projectId),
      this.removeInitiativeFromMilestone(orgId, projectId),
    ];
  }

  private findOneMilestone(orgId: string, projectId: string) {
    return tool(
      async ({ milestoneId }) => {
        if (!milestoneId) {
          return 'Please provide a milestone ID';
        }

        const findOptions = {
          id: milestoneId,
          org: {
            id: orgId,
          },
          project: {
            id: projectId,
          },
        };

        try {
          const milestone = await this.milestoneRepository.findOneOrFail({
            where: findOptions,
            relations: ['initiatives'],
          });

          const initiatives = await milestone.initiatives;
          const initiativeCount = initiatives ? initiatives.length : 0;

          return `
              Title: ${milestone.title}
              Description: ${milestone.description || 'No description'}
              Due Date: ${
                milestone.dueDate
                  ? milestone.dueDate.toISOString().split('T')[0]
                  : 'Not set'
              }
              Initiatives Count: ${initiativeCount}
              ID: ${milestone.id}
              `;
        } catch (e) {
          return 'Failed to find the milestone';
        }
      },
      {
        name: 'find-one-milestone',
        description: 'Find a milestone in the system based on its ID.',
        schema: z.object({
          milestoneId: z.string().describe('The milestone ID to search for'),
        }),
      },
    );
  }

  private findOneMilestoneByTitle(orgId: string, projectId: string) {
    return tool(
      async ({ milestoneTitle }) => {
        if (!milestoneTitle) {
          return 'Please provide a milestone title';
        }

        const findOptions = {
          title: Like(`%${milestoneTitle}%`),
          org: {
            id: orgId,
          },
          project: {
            id: projectId,
          },
        };

        try {
          const milestone = await this.milestoneRepository.findOneOrFail({
            where: findOptions,
            relations: ['initiatives'],
          });

          const initiatives = await milestone.initiatives;
          const initiativeCount = initiatives ? initiatives.length : 0;

          return `
              Title: ${milestone.title}
              Description: ${milestone.description || 'No description'}
              Due Date: ${
                milestone.dueDate
                  ? milestone.dueDate.toISOString().split('T')[0]
                  : 'Not set'
              }
              Initiatives Count: ${initiativeCount}
              ID: ${milestone.id}
              `;
        } catch (e) {
          return 'Failed to find the milestone';
        }
      },
      {
        name: 'find-one-milestone-by-title',
        description: 'Find a milestone in the system based on its title.',
        schema: z.object({
          milestoneTitle: z
            .string()
            .describe('The milestone title to search for'),
        }),
      },
    );
  }

  private listMilestones(orgId: string, projectId: string) {
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

          const milestones = await this.milestoneRepository.find({
            where: findOptions,
            order: { dueDate: 'ASC' },
            relations: ['initiatives'],
          });

          let output = 'Milestones:\n';
          for (const milestone of milestones) {
            const initiatives = await milestone.initiatives;
            const initiativeCount = initiatives ? initiatives.length : 0;
            const dueDateStr = milestone.dueDate
              ? milestone.dueDate.toISOString().split('T')[0]
              : 'No due date';

            output += `- ${milestone.title} (${dueDateStr}) - ${initiativeCount} initiatives - ID: ${milestone.id}\n`;
          }

          return output || 'No milestones found';
        } catch (e) {
          return 'Failed to list milestones';
        }
      },
      {
        name: 'list-milestones',
        description: 'List all milestones in the project/organization.',
        schema: z.object({}),
      },
    );
  }

  private listMilestoneInitiatives(orgId: string, projectId: string) {
    return tool(
      async ({ milestoneId }) => {
        if (!milestoneId) {
          return 'Please provide a milestone ID';
        }

        try {
          const findOptions = {
            id: milestoneId,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          };

          const milestone = await this.milestoneRepository.findOneOrFail({
            where: findOptions,
            relations: ['initiatives'],
          });

          const initiatives = await milestone.initiatives;

          if (!initiatives || initiatives.length === 0) {
            return `Milestone "${milestone.title}" has no initiatives`;
          }

          let output = `Initiatives in milestone "${milestone.title}":\n`;
          for (const initiative of initiatives) {
            output += `- ${initiative.reference}: ${initiative.title} (${initiative.status}, ${initiative.priority} priority)\n`;
          }

          return output;
        } catch (e) {
          return 'Failed to list milestone initiatives';
        }
      },
      {
        name: 'list-milestone-initiatives',
        description: 'List all initiatives within a specific milestone.',
        schema: z.object({
          milestoneId: z
            .string()
            .describe('The milestone ID to get initiatives for'),
        }),
      },
    );
  }

  private listMilestonesForTimeline(orgId: string, projectId: string) {
    return tool(
      async ({ timeline }) => {
        if (!projectId) {
          return 'Project ID is required for timeline filtering';
        }

        try {
          const timelineEnum = timeline as Timeline;
          const milestones = await this.milestonesService.listForTimeline(
            orgId,
            projectId,
            timelineEnum,
          );

          if (milestones.length === 0) {
            return `No milestones found for timeline: ${timeline}`;
          }

          let output = `Milestones for ${timeline}:\n`;
          for (const milestone of milestones) {
            const dueDateStr = milestone.dueDate
              ? new Date(milestone.dueDate).toISOString().split('T')[0]
              : 'No due date';
            output += `- ${milestone.title} (${dueDateStr}) - ID: ${milestone.id}\n`;
          }

          return output;
        } catch (e) {
          return `Failed to list milestones for timeline: ${timeline}`;
        }
      },
      {
        name: 'list-milestones-for-timeline',
        description:
          'List milestones filtered by timeline (this-quarter, next-quarter, later, past).',
        schema: z.object({
          timeline: z
            .enum(['this-quarter', 'next-quarter', 'later', 'past'])
            .describe('The timeline to filter milestones by'),
        }),
      },
    );
  }

  private getMilestoneProgress(orgId: string, projectId: string) {
    return tool(
      async ({ milestoneId }) => {
        if (!milestoneId) {
          return 'Please provide a milestone ID';
        }

        try {
          const findOptions = {
            id: milestoneId,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          };

          const milestone = await this.milestoneRepository.findOneOrFail({
            where: findOptions,
            relations: ['initiatives'],
          });

          const initiatives = await milestone.initiatives;

          if (!initiatives || initiatives.length === 0) {
            return `Milestone "${milestone.title}" has no initiatives to track progress`;
          }

          const statusCounts = {
            planned: 0,
            'ready-to-start': 0,
            'in-progress': 0,
            completed: 0,
            closed: 0,
          };

          initiatives.forEach((initiative) => {
            statusCounts[initiative.status]++;
          });

          const total = initiatives.length;
          const completed = statusCounts.completed + statusCounts.closed;
          const progressPercentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

          return `
          Milestone: ${milestone.title}
          Due Date: ${
            milestone.dueDate
              ? milestone.dueDate.toISOString().split('T')[0]
              : 'Not set'
          }
          Progress: ${progressPercentage}% (${completed}/${total} initiatives completed)
          
          Initiative Status Breakdown:
          - Planned: ${statusCounts.planned}
          - Ready to Start: ${statusCounts['ready-to-start']}
          - In Progress: ${statusCounts['in-progress']}
          - Completed: ${statusCounts.completed}
          - Closed: ${statusCounts.closed}
          `;
        } catch (e) {
          return 'Failed to get milestone progress';
        }
      },
      {
        name: 'get-milestone-progress',
        description:
          'Get progress information for a milestone based on its initiatives.',
        schema: z.object({
          milestoneId: z
            .string()
            .describe('The milestone ID to get progress for'),
        }),
      },
    );
  }

  private confirmAndCreateMilestone(orgId: string, projectId: string) {
    return tool(
      async ({ milestoneTitle, milestoneDescription, milestoneDueDate }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });

          // Validate date format
          if (!/^\d{4}-\d{2}-\d{2}$/.test(milestoneDueDate)) {
            return 'Due date must be in YYYY-MM-DD format';
          }

          const savedMilestone = await this.milestonesService.createMilestone(
            org.id,
            project.id,
            {
              title: milestoneTitle,
              description: milestoneDescription,
              dueDate: milestoneDueDate,
            },
          );

          return `Successfully created milestone\n
          Milestone Details\n
          - title: ${savedMilestone.title}\n
          - description: ${savedMilestone.description}\n
          - due date: ${savedMilestone.dueDate}\n
          - id: ${savedMilestone.id}`;
        } catch (e) {
          return 'Failed to create milestone because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-create-milestone',
        description:
          'After the user explicitly approves a proposal in natural language, call this tool to create the milestone.',
        schema: z.object({
          milestoneTitle: z.string().describe('The milestone title.'),
          milestoneDescription: z
            .string()
            .optional()
            .describe('The milestone description (optional).'),
          milestoneDueDate: z
            .string()
            .describe('The milestone due date in YYYY-MM-DD format.'),
        }),
      },
    );
  }

  private confirmAndUpdateMilestone(orgId: string, projectId: string) {
    return tool(
      async ({
        milestoneId,
        milestoneTitle,
        milestoneDescription,
        milestoneDueDate,
      }) => {
        try {
          // Validate date format if provided
          if (
            milestoneDueDate &&
            !/^\d{4}-\d{2}-\d{2}$/.test(milestoneDueDate)
          ) {
            return 'Due date must be in YYYY-MM-DD format';
          }

          const updatedMilestone = await this.milestonesService.update(
            orgId,
            projectId,
            milestoneId,
            {
              title: milestoneTitle,
              description: milestoneDescription,
              dueDate: milestoneDueDate,
            },
          );

          return `Successfully updated milestone\n
          Milestone Details\n
          - title: ${updatedMilestone.title}\n
          - description: ${updatedMilestone.description}\n
          - due date: ${updatedMilestone.dueDate}\n
          - id: ${updatedMilestone.id}`;
        } catch (e) {
          return 'Failed to update milestone because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-update-milestone',
        description:
          'After the user explicitly approves a milestone update in natural language, call this tool to update the milestone.',
        schema: z.object({
          milestoneId: z.string().describe('The milestone ID to update'),
          milestoneTitle: z.string().describe('The milestone title.'),
          milestoneDescription: z
            .string()
            .optional()
            .describe('The milestone description (optional).'),
          milestoneDueDate: z
            .string()
            .describe('The milestone due date in YYYY-MM-DD format.'),
        }),
      },
    );
  }

  private addInitiativeToMilestone(orgId: string, projectId: string) {
    return tool(
      async ({ milestoneId, initiativeReference }) => {
        try {
          // Find the milestone
          const milestone = await this.milestoneRepository.findOneByOrFail({
            id: milestoneId,
            org: { id: orgId },
            project: { id: projectId },
          });

          // Find the initiative
          const initiative = await this.initiativeRepository.findOneByOrFail({
            reference: initiativeReference,
            org: { id: orgId },
            project: { id: projectId },
          });

          // Update the initiative to belong to the milestone
          initiative.milestone = Promise.resolve(milestone);
          await this.initiativeRepository.save(initiative);

          return `Successfully added initiative ${initiativeReference} to milestone "${milestone.title}"`;
        } catch (e) {
          return (
            'Failed to add initiative to milestone because ' +
            (e as any).message
          );
        }
      },
      {
        name: 'add-initiative-to-milestone',
        description: 'Add an initiative to a milestone.',
        schema: z.object({
          milestoneId: z
            .string()
            .describe('The milestone ID to add the initiative to'),
          initiativeReference: z
            .string()
            .describe(
              'The initiative reference (e.g., I-123) to add to the milestone',
            ),
        }),
      },
    );
  }

  private removeInitiativeFromMilestone(orgId: string, projectId: string) {
    return tool(
      async ({ initiativeReference }) => {
        try {
          // Find the initiative
          const initiative = await this.initiativeRepository.findOneByOrFail({
            reference: initiativeReference,
            org: { id: orgId },
            project: { id: projectId },
          });

          // Remove the initiative from its milestone (move to backlog)
          initiative.milestone = Promise.resolve(null);
          await this.initiativeRepository.save(initiative);

          return `Successfully removed initiative ${initiativeReference} from its milestone and moved it to the backlog`;
        } catch (e) {
          return (
            'Failed to remove initiative from milestone because ' +
            (e as any).message
          );
        }
      },
      {
        name: 'remove-initiative-from-milestone',
        description:
          'Remove an initiative from its milestone and move it to the backlog.',
        schema: z.object({
          initiativeReference: z
            .string()
            .describe(
              'The initiative reference (e.g., I-123) to remove from its milestone',
            ),
        }),
      },
    );
  }
}
