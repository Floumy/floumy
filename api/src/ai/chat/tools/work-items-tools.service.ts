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
import { WorkItemType } from '../../../backlog/work-items/work-item-type.enum';

@Injectable()
export class WorkItemsToolsService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
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
      async ({ workItemTitle, workItemDescription, workItemType }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });
          const user = await this.userRepository.findOneByOrFail({
            id: userId,
          });

          const savedWorkItem = await this.workItemsService.createWorkItem(
            org.id,
            project.id,
            user.id,
            {
              title: workItemTitle,
              type: WorkItemType[workItemType],
              description: workItemDescription,
              status: WorkItemStatus.PLANNED,
              priority: Priority.MEDIUM,
            },
          );

          return `Successfully created work item with reference ${savedWorkItem.reference}\nWork Item Details\n- title: ${savedWorkItem.title}\n- type: ${savedWorkItem.type}\n- description: ${savedWorkItem.description}\n- status: ${savedWorkItem.status}\n- priority: ${savedWorkItem.priority}`;
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
        }),
      },
    );
  }
}
