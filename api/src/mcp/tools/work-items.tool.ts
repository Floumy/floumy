import { Inject, Injectable, Scope } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import z from 'zod';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkItem } from 'src/backlog/work-items/work-item.entity';
import { Repository } from 'typeorm';
import { WorkItemType } from 'src/backlog/work-items/work-item-type.enum';
import { Org } from 'src/orgs/org.entity';
import { Project } from 'src/projects/project.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { McpService } from '../services/mcp.service';
import { entityNotFound } from '../utils';
import { WorkItemStatus } from '../../backlog/work-items/work-item-status.enum';

@Injectable({
  scope: Scope.REQUEST,
})
export class WorkItemsTool {
  constructor(
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private mcpService: McpService,
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
    description: 'Find all work items for the current user.',
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
    workItem.type = WorkItemType[type];
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: {
        id: org.id,
      },
    });
    workItem.org = Promise.resolve(org);
    workItem.project = Promise.resolve(project);
    const savedWorkItem = await this.workItemsRepository.save(workItem);
    return {
      content: [
        {
          type: 'text',
          text: `
                Work Item Created:
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
      workItem.type = WorkItemType[type];
    }

    if (status) {
      workItem.status = WorkItemStatus[status];
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
}
