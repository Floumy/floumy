import { Inject, Injectable, Scope } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import z from 'zod';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkItem } from 'src/backlog/work-items/work-item.entity';
import { Repository } from 'typeorm';
import { WorkItemType } from 'src/backlog/work-items/work-item-type.enum';
import { Project } from 'src/projects/project.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { McpService } from '../services/mcp.service';
import { entityNotFound } from '../utils';
import { WorkItemStatus } from '../../backlog/work-items/work-item-status.enum';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { Priority } from '../../common/priority.enum';
import { Sprint } from '../../sprints/sprint.entity';

@Injectable({
  scope: Scope.REQUEST,
})
export class WorkItemsTool {
  constructor(
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private mcpService: McpService,
    private workItemsService: WorkItemsService,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Tool({
    name: 'find-work-item-by-reference',
    description:
      'Find a work item in the system based on its reference. The reference is in the form of WI-123',
    parameters: z.object({
      reference: z.string().describe('The work item reference (e.g. WI-123).'),
    }),
  })
  async findWorkItemByReference({ reference }: { reference: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('work item');
    }
    const org = await user.org;
    const workItem = await this.workItemsRepository.findOneBy({
      reference,
      org: { id: org.id },
    });
    if (!workItem) {
      return entityNotFound('work item');
    }

    return {
      content: [
        {
          type: 'text',
          text: `
                Title: ${workItem.title}
                Description: ${workItem.description}
                Type: ${workItem.type}
                Status: ${workItem.status}
                Reference: ${workItem.reference}
                `,
        },
      ],
    };
  }

  @Tool({
    name: 'find-my-work-items',
    description: 'Find the latest 10 work items assigned to the current user.',
  })
  async findMyWorkItems() {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('work item');
    }
    const org = await user.org;
    const workItems = await this.workItemsRepository.find({
      where: {
        org: { id: org.id },
        assignedTo: { id: user.id },
      },
      order: {
        updatedAt: 'DESC',
      },
      take: 10,
    });

    return {
      content: workItems.map((item) => ({
        type: 'text',
        text: `
          Title: ${item.title}
          Description: ${item.description}
          Type: ${item.type}
          Status: ${item.status}
          Reference: ${item.reference}
        `,
      })),
    };
  }

  @Tool({
    name: 'create-work-item',
    description: 'Create a new work item.',
    parameters: z.object({
      projectId: z
        .string()
        .describe('The ID of the project to create the work item in.'),
      title: z.string().describe('The work item title.'),
      description: z.string().describe('The work item description.'),
      type: z
        .enum(['user-story', 'task', 'bug', 'spike', 'technical-debt'])
        .describe('The work item type.'),
    }),
  })
  async createWorkItem({
    projectId,
    title,
    description,
    type,
  }: {
    projectId: string;
    title: string;
    description: string;
    type: string;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);

    if (!user) {
      return entityNotFound('work item');
    }

    const workItem = new WorkItem();
    workItem.title = title;
    workItem.description = description;
    workItem.type = type as WorkItemType;
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: {
        id: org.id,
      },
    });
    workItem.org = Promise.resolve(org);
    workItem.project = Promise.resolve(project);
    const savedWorkItem = await this.workItemsService.createWorkItem(
      org.id,
      project.id,
      user.id,
      {
        title: title,
        type: type as WorkItemType,
        description: description,
        status: WorkItemStatus.PLANNED,
        priority: Priority.MEDIUM,
      },
    );
    return {
      content: [
        {
          type: 'text',
          text: `
                Successfully created work item with reference ${savedWorkItem.reference}
                Work Item Details
                title: ${savedWorkItem.title}
                type: ${savedWorkItem.type}
                description: ${savedWorkItem.description}
                status: ${savedWorkItem.status}
                priority: ${savedWorkItem.priority}
              `,
        },
      ],
    };
  }

  @Tool({
    name: 'update-work-item-by-reference',
    description:
      'Update a work item in the system based on its reference. The reference is in the form of WI-123',
    parameters: z.object({
      reference: z.string().describe('The work item reference (e.g. WI-123).'),
      title: z.string().optional().describe('The work item title.'),
      description: z.string().optional().describe('The work item description.'),
      type: z
        .enum(['user-story', 'task', 'bug', 'spike', 'technical-debt'])
        .describe('The work item type.'),
      status: z
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
        .describe('The work item status.'),
    }),
  })
  async updateWorkItemByReference({
    reference,
    title,
    description,
    type,
    status,
  }: {
    reference: string;
    title?: string;
    description?: string;
    type?: string;
    status?: string;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('work item');
    }
    const org = await user.org;
    const workItem = await this.workItemsRepository.findOneByOrFail({
      reference,
      org: { id: org.id },
    });
    if (!workItem) {
      return entityNotFound('work item');
    }

    if (title) {
      workItem.title = title;
    }

    if (description) {
      workItem.description = description;
    }

    if (type) {
      workItem.type = type as WorkItemType;
    }

    if (status) {
      workItem.status = status as WorkItemStatus;
    }

    const savedWorkItem = await this.workItemsRepository.save(workItem);
    return {
      content: [
        {
          type: 'text',
          text: `
                Work Item Updated:
                Title: ${savedWorkItem.title}
                Description: ${savedWorkItem.description}
                Type: ${savedWorkItem.type}
                Status: ${savedWorkItem.status}
                Reference: ${savedWorkItem.reference}
              `,
        },
      ],
    };
  }
  @Tool({
    name: 'list-work-items-for-sprint',
    description: 'List all work items for a given sprint.',
    parameters: z.object({
      sprintId: z.string().describe('The ID of the sprint.'),
    }),
  })
  async listWorkItemsForSprint({ sprintId }: { sprintId: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('work item');
    }
    const org = await user.org;
    const workItems = await this.workItemsRepository.find({
      where: { sprint: { id: sprintId }, org: { id: org.id } },
      order: { updatedAt: 'DESC' },
    });
    if (!workItems.length) {
      return {
        content: [
          {
            type: 'text',
            text: 'No work items found for this sprint.',
          },
        ],
      };
    }
    return {
      content: workItems.map((wi) => ({
        type: 'text',
        text: `Title: ${wi.title}
        Type: ${wi.type}
        Status: ${wi.status}
        Reference: ${wi.reference}`,
      })),
    };
  }
  @Tool({
    name: 'add-work-item-to-sprint',
    description: 'Add a work item to a sprint.',
    parameters: z.object({
      workItemReference: z
        .string()
        .describe('The reference of the work item (e.g. WI-123).'),
      sprintId: z.string().describe('The ID of the sprint.'),
    }),
  })
  async addWorkItemToSprint({
    workItemReference,
    sprintId,
  }: {
    workItemReference: string;
    sprintId: string;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('work item');
    }
    const org = await user.org;
    try {
      const workItem = await this.workItemsRepository.findOneByOrFail({
        reference: workItemReference,
        org: { id: org.id },
      });
      if (!workItem) {
        return entityNotFound('work item');
      }
      const sprint = await this.sprintRepository.findOneByOrFail({
        id: sprintId,
        org: { id: org.id },
      });
      workItem.sprint = Promise.resolve(sprint);
      await this.workItemsRepository.save(workItem);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully added work item ${workItem.reference} to sprint.`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${e.message}`,
          },
        ],
      };
    }
  }
}
