import { Injectable } from "@nestjs/common";
import { Resource, Tool } from "@rekog/mcp-nest";
import { Context } from "vm";
import z from "zod";
import type { Request } from 'express';
import { InjectRepository } from "@nestjs/typeorm";
import { WorkItem } from "src/backlog/work-items/work-item.entity";
import { Repository } from "typeorm";
import { WorkItemStatus } from "src/backlog/work-items/work-item-status.enum";
import { WorkItemType } from "src/backlog/work-items/work-item-type.enum";
import { Org } from "src/orgs/org.entity";
import { Project } from "src/projects/project.entity";

@Injectable()
export class WorkItemsTool {

    constructor(
        @InjectRepository(WorkItem)
        private workItemsRepository: Repository<WorkItem>,
        @InjectRepository(Org)
        private orgRepository: Repository<Org>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
    ) {}

    @Tool({
        name: 'find-work-item-by-reference',
        description: 'Find a work item in the system based on its reference. The reference is in the form of WI-123',
        parameters: z.object({
            reference: z.string().describe('The work item reference (e.g. WI-123).'),
        }),
    })
    async findWorkItemByReference({ reference }: { reference: string }, context: Context, request: Request) {
        const orgId = request.params.orgId;
        const workItem = await this.workItemsRepository.findOneBy({
            reference,
            org: { id: orgId },
        });
        return workItem;
    }

    @Tool({
        name: 'find-my-in-progress-work-items',
        description: 'Find all work items in progress for the current user.',
    })
    async findMyInProgressWorkItems(request: Request) {
        const workItems = await this.workItemsRepository.find({
            where: {
                org: { id: request.params.orgId },
                assignedTo: { id: request.params.userId },
                status: WorkItemStatus.IN_PROGRESS,
            },
        });
        return workItems;
    }

    @Tool({
        name: 'find-my-work-items',
        description: 'Find all work items for the current user.',
    })
    async findMyWorkItems(request: Request) {
        const workItems = await this.workItemsRepository.find({
            where: {
                org: { id: request.params.orgId },
                assignedTo: { id: request.params.userId },
            },
        }); 
        return workItems;
    }   

    @Tool({
        name: 'find-work-items-by-project-name',
        description: 'Find all work items for a specific project.',
    })
    async findWorkItemsByProject({ name }: { name: string }, request: Request) {
        const workItems = await this.workItemsRepository.find({
            where: {
                org: { id: request.params.orgId },
                project: { name },
            },
        }); 
        return workItems;
    }   

    @Tool({
        name: 'create-work-item',
        description: 'Create a new work item.',
        parameters: z.object({
            title: z.string().describe('The work item title.'),
            description: z.string().describe('The work item description.'),
            type: z.enum(['user-story', 'task', 'bug', 'spike', 'technical-debt']).describe('The work item type.'),
        }),
    })
    async createWorkItem({ title, description, type }: { title: string, description: string, type: string }, request: Request) {
        const workItem = new WorkItem();
        workItem.title = title;
        workItem.description = description;
        workItem.type = WorkItemType[type];
        const org = await this.orgRepository.findOneByOrFail({
            id: request.params.orgId,
        });
        const project = await this.projectRepository.findOneByOrFail({
            id: request.params.projectId,
            org: {
                id: request.params.orgId,
            },
        });
        workItem.org = Promise.resolve(org);
        workItem.project = Promise.resolve(project);
        const savedWorkItem = await this.workItemsRepository.save(workItem);
        return savedWorkItem;
    }

    @Tool({
        name: 'update-work-item-by-reference',
        description: 'Update a work item in the system based on its reference.',
        parameters: z.object({
            reference: z.string().describe('The work item reference.'),
            title: z.string().describe('The work item title.'),
            description: z.string().describe('The work item description.'),
            type: z.enum(['user-story', 'task', 'bug', 'spike', 'technical-debt']).describe('The work item type.'),
        }),
    })
    async updateWorkItemByReference({ reference, title, description, type }: { reference: string, title: string, description: string, type: string }, request: Request) {
        const workItem = await this.workItemsRepository.findOneByOrFail({
            reference,
            org: { id: request.params.orgId },
        });
        workItem.title = title;
        workItem.description = description;
        workItem.type = WorkItemType[type];
        const savedWorkItem = await this.workItemsRepository.save(workItem);
        return savedWorkItem;
    }
}
