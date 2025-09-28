import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpService } from '../services/mcp.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { Tool } from '@rekog/mcp-nest';
import { entityNotFound } from '../utils';
import z from 'zod';
import { Project } from '../../projects/project.entity';
import { InitiativesService } from '../../roadmap/initiatives/initiatives.service';
import { InitiativeStatus } from '../../roadmap/initiatives/initiativestatus.enum';
import { Priority } from '../../common/priority.enum';

@Injectable({
  scope: Scope.REQUEST,
})
export class InitiativeTool {
  constructor(
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    private mcpService: McpService,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private initiativeService: InitiativesService,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Tool({
    name: 'find-org-initiatives',
    description: 'List latest 10 initiatives in the organization.',
  })
  async findOrgInitiatives() {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('initiative');
    }

    const org = await user.org;
    const initiatives = await this.initiativeRepository.find({
      where: { org: { id: org.id } },
      order: {
        updatedAt: 'DESC',
      },
      take: 10,
    });

    return {
      content: initiatives.map((initiative) => ({
        type: 'text',
        text: `Title: ${initiative.title}
              Description: ${initiative.description}
              Status: ${initiative.status}
              Reference: ${initiative.reference}`,
      })),
    };
  }

  @Tool({
    name: 'find-my-initiatives',
    description: 'List latest 10 initiatives assigned to the current user.',
  })
  async findMyInitiatives() {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('initiative');
    }
    const org = await user.org;
    const initiatives = await this.initiativeRepository.find({
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
      content: initiatives.map((initiative) => ({
        type: 'text',
        text: `Title: ${initiative.title}
              Description: ${initiative.description}
              Status: ${initiative.status}
              Reference: ${initiative.reference}`,
      })),
    };
  }

  @Tool({
    name: 'get-initiative-by-reference',
    description:
      'Get an initiative in the system based on its reference. The reference is in the form of I-123',
    parameters: z.object({
      reference: z
        .string()
        .describe(
          'The reference of the initiative to retrieve. The reference is in the form of I-123',
        ),
    }),
  })
  async getInitiativeByReference({ reference }: { reference: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('initiative');
    }
    const org = await user.org;
    const initiative = await this.initiativeRepository.findOne({
      where: { reference, org: { id: org.id } },
    });
    if (!initiative) {
      return entityNotFound('initiative');
    }
    return {
      content: [
        {
          type: 'text',
          text: `Successfully retrieved initiative with reference: ${initiative.reference}
          Title: ${initiative.title}
          Description: ${initiative.description}
          Status: ${initiative.status}
          Priority: ${initiative.priority}`,
        },
      ],
    };
  }

  @Tool({
    name: 'create-initiative',
    description: 'Create a new initiative with title and description.',
    parameters: z.object({
      projectId: z
        .string()
        .describe('The ID of the project to create the initiative in.'),
      title: z.string().describe('The title of the initiative.'),
      description: z.string().describe('The description of the initiative.'),
    }),
  })
  async createInitiative({
    projectId,
    title,
    description,
  }: {
    projectId: string;
    title: string;
    description: string;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('initiative');
    }
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: {
        id: org.id,
      },
    });
    const initiative = await this.initiativeService.createInitiative(
      org.id,
      project.id,
      user.id,
      {
        title,
        description,
        status: InitiativeStatus.PLANNED,
        priority: Priority.MEDIUM,
      },
    );
    return {
      content: [
        {
          type: 'text',
          text: `Successfully created initiative with reference: ${initiative.reference}
          Title: ${initiative.title}
          Description: ${initiative.description}
          Status: ${initiative.status}
          Priority: ${initiative.priority}`,
        },
      ],
    };
  }

  @Tool({
    name: 'upgrade-initiative-by-reference',
    description:
      'Update an initiative in the system based on its reference. The reference is in the form of I-123',
    parameters: z.object({
      reference: z
        .string()
        .describe(
          'The reference of the initiative to update. The reference is in the form of I-123',
        ),
      title: z
        .string()
        .optional()
        .describe('The new title of the initiative to update.'),
      description: z
        .string()
        .optional()
        .describe('The new description of the initiative to update.'),
      status: z
        .enum([
          InitiativeStatus.PLANNED,
          InitiativeStatus.IN_PROGRESS,
          InitiativeStatus.COMPLETED,
          InitiativeStatus.READY_TO_START,
        ])
        .optional()
        .describe('The new status of the initiative to update.'),
      priority: z
        .enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH])
        .optional()
        .describe('The new priority of the initiative to update.'),
    }),
  })
  async updateInitiativeByReference({
    reference,
    title,
    description,
    status,
    priority,
  }: {
    reference: string;
    title?: string;
    description?: string;
    status?: InitiativeStatus;
    priority?: Priority;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('initiative');
    }
    const org = await user.org;
    const initiative = await this.initiativeRepository.findOne({
      where: { reference, org: { id: org.id } },
    });
    if (!initiative) {
      return entityNotFound('initiative');
    }
    if (title) {
      initiative.title = title;
    }
    if (description) {
      initiative.description = description;
    }
    if (status) {
      initiative.status = status;
    }
    if (priority) {
      initiative.priority = priority;
    }
    const savedInitiative = await this.initiativeRepository.save(initiative);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated initiative with reference: ${savedInitiative.reference}
          Title: ${savedInitiative.title}
          Description: ${savedInitiative.description}
          Status: ${savedInitiative.status}
          Priority: ${savedInitiative.priority}`,
        },
      ],
    };
  }
}
