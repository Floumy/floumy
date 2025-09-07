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
import { WorkItemsService } from '../../../backlog/work-items/work-items.service';
import { Priority } from '../../../common/priority.enum';
import { WorkItemStatus } from '../../../backlog/work-items/work-item-status.enum';

@Injectable()
export class WorkItemsToolsService {
  // In-memory pending proposals for human-in-the-loop confirmation
  private pendingProposals = new Map<
    string,
    {
      orgId: string;
      projectId: string;
      userId: string;
      title: string;
      description: string;
      type: WorkItemType;
      createdAt: number;
    }
  >();

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
      tools.push(this.proposeWorkItem(orgId, projectId, userId));
      tools.push(this.confirmWorkItem(orgId, projectId, userId));
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

  private proposeWorkItem(orgId: string, projectId: string, userId: string) {
    return tool(
      async ({ workItemTitle, workItemDescription, workItemType }) => {
        if (!workItemTitle) {
          return 'Please provide a work item title';
        }
        if (!workItemDescription) {
          return 'Please provide a work item description';
        }
        // Validate inputs and create a pending proposal id
        const proposalId = `${userId}:${Date.now()}`;
        this.pendingProposals.set(proposalId, {
          orgId,
          projectId,
          userId,
          title: workItemTitle,
          description: workItemDescription,
          type: workItemType as WorkItemType,
          createdAt: Date.now(),
        });
        return `Here’s a draft for a new work item:\n- title: ${workItemTitle}\n- type: ${workItemType}\n- description: ${workItemDescription}\n\nDoes this look good as is, or would you like any changes? If you’re happy with it, just say so and I’ll create it.`;
      },
      {
        name: 'propose-work-item',
        description:
          'Draft a new work item and present it to the user for approval. Do not actually create anything. Ask the user to confirm.',
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

  private confirmWorkItem(orgId: string, projectId: string, userId: string) {
    return tool(
      async ({ confirmationCode }) => {
        // Allow relaxed confirmations without requiring the user to paste a code.
        // If no code is provided, pick the most recent pending proposal for this user/org/project.
        let keyToUse = confirmationCode;
        if (!keyToUse) {
          let newest: { key: string; createdAt: number } | undefined;
          for (const [k, v] of this.pendingProposals.entries()) {
            if (
              v.orgId === orgId &&
              v.projectId === projectId &&
              v.userId === userId
            ) {
              if (!newest || v.createdAt > newest.createdAt) {
                newest = { key: k, createdAt: v.createdAt };
              }
            }
          }
          if (newest) {
            keyToUse = newest.key;
          }
        }
        if (!keyToUse) {
          return "I don't have any recent drafts to confirm. Let me propose one first.";
        }
        const pending = this.pendingProposals.get(keyToUse);
        if (!pending) {
          return 'Invalid or expired confirmation code.';
        }
        // Basic expiry: 30 minutes
        if (Date.now() - pending.createdAt > 30 * 60 * 1000) {
          this.pendingProposals.delete(keyToUse);
          return 'Confirmation code expired. Please propose the work item again.';
        }
        // Ensure code belongs to same org/project/user context
        if (
          pending.orgId !== orgId ||
          pending.projectId !== projectId ||
          pending.userId !== userId
        ) {
          return 'Confirmation code does not match the current context.';
        }
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
              title: pending.title,
              type: pending.type,
              description: pending.description,
              status: WorkItemStatus.PLANNED,
              priority: Priority.MEDIUM,
            },
          );

          this.pendingProposals.delete(keyToUse);

          return `Successfully created work item with reference ${savedWorkItem.reference}\nWork Item Details\n- title: ${savedWorkItem.title}\n- type: ${savedWorkItem.type}\n- description: ${savedWorkItem.description}\n- status: ${savedWorkItem.status}\n- priority: ${savedWorkItem.priority}`;
        } catch (e) {
          return 'Failed to create work item because ' + e.message;
        }
      },
      {
        name: 'confirm-work-item',
        description:
          'After the user explicitly approves a proposal in natural language, call this tool to create the work item. Passing a confirmation code is optional; if omitted, the most recent pending draft for this user/project/org will be used.',
        schema: z.object({
          confirmationCode: z
            .string()
            .optional()
            .describe(
              'Optional: a confirmation code identifying a specific draft; omit to use the latest pending draft.',
            ),
        }),
      },
    );
  }
}
