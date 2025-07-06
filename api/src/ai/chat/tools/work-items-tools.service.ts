import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.entity';
import { User } from '../../../users/user.entity';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
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
  ) {}

  getTools(orgId: string, projectId?: string, userId?: string) {
    const tools: DynamicStructuredTool[] = [
      this.findOneWorkItem(orgId, projectId),
    ];
    if (projectId && userId) {
      tools.push(this.createWorkItem(orgId, projectId, userId));
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

  private createWorkItem(orgId: string, projectId: string, userId: string) {
    return tool(
      async ({ workItemTitle, workItemDescription, workItemType }) => {
        if (!workItemTitle) {
          return 'Please provide a work item title';
        }

        if (!workItemDescription) {
          return 'Please provide a work item description';
        }
        try {
          const org = await this.orgRepository.findOneByOrFail({
            id: orgId,
          });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: {
              id: orgId,
            },
          });
          const user = await this.userRepository.findOneByOrFail({
            id: userId,
          });
          const workItem = new WorkItem();
          workItem.title = workItemTitle;
          workItem.type = workItemType as WorkItemType;
          workItem.description = workItemDescription;
          workItem.org = Promise.resolve(org);
          workItem.project = Promise.resolve(project);
          workItem.createdBy = Promise.resolve(user);
          await this.workItemRepository.save(workItem);
          const savedWorkItem = await this.workItemRepository.findOneByOrFail({
            id: workItem.id,
          });

          return `Successfully created work item with reference ${savedWorkItem.reference}`;
        } catch (e) {
          return 'Failed to create work item because ' + e.message;
        }
      },
      {
        name: 'create-work-item',
        description: 'Create a new work item in the system.',
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
