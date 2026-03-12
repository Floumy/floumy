import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpService } from '../services/mcp.service';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Tool } from '@rekog/mcp-nest';
import { entityNotFound } from '../utils';
import z from 'zod';
import { Cycle } from '../../cycles/cycle.entity';
import { CyclesService } from '../../cycles/cycles.service';
import { Project } from '../../projects/project.entity';
import { CycleStatus } from '../../cycles/cycle-status.enum';

@Injectable({
  scope: Scope.REQUEST,
})
export class CycleTool {
  constructor(
    @InjectRepository(Cycle)
    private cycleRepository: Repository<Cycle>,
    private mcpService: McpService,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private cyclesService: CyclesService,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Tool({
    name: 'find-active-cycle',
    description: 'Find the current active cycle in a project.',
    parameters: z.object({
      projectId: z.string().describe('The ID of the project.'),
    }),
  })
  async findActiveCycle({ projectId }: { projectId: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('cycle');
    }
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: org.id },
    });
    const cycle = await this.cycleRepository.findOne({
      where: {
        org: { id: org.id },
        project: { id: project.id },
        status: CycleStatus.ACTIVE,
      },
      order: { updatedAt: 'DESC' },
    });
    if (!cycle) {
      return {
        content: [
          {
            type: 'text',
            text: `No active cycle found in project ${project.name}.`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: `Title: ${cycle.title}
          Goal: ${cycle.goal}
          Start date: ${cycle.startDate?.toISOString().split('T')[0]}
          Status: ${cycle.status}
          Cycle ID: ${cycle.id}`,
        },
      ],
    };
  }
  @Tool({
    name: 'find-org-cycles',
    description: 'List latest 10 cycles in the organization.',
  })
  async findOrgCycles() {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('cycle');
    }
    const org = await user.org;
    const cycles = await this.cycleRepository.find({
      where: { org: { id: org.id } },
      order: { startDate: 'DESC' },
      take: 10,
    });
    return {
      content: cycles.map((cycle) => ({
        type: 'text',
        text: `Title: ${cycle.title}
        Goal: ${cycle.goal}
        Status: ${cycle.status}
        Cycle ID: ${cycle.id}`,
      })),
    };
  }

  @Tool({
    name: 'find-project-cycles',
    description: 'List latest 10 cycles in a project.',
    parameters: z.object({
      projectId: z.string().describe('The ID of the project.'),
    }),
  })
  async findProjectCycles({ projectId }: { projectId: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('cycle');
    }
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: org.id },
    });
    const cycles = await this.cycleRepository.find({
      where: { org: { id: org.id }, project: { id: project.id } },
      order: { startDate: 'DESC' },
      take: 10,
    });
    return {
      content: cycles.map((cycle) => ({
        type: 'text',
        text: `Title: ${cycle.title}
        Goal: ${cycle.goal}
        Status: ${cycle.status}
        Cycle ID: ${cycle.id}`,
      })),
    };
  }
  @Tool({
    name: 'create-cycle',
    description: 'Create a new cycle in a project.',
    parameters: z.object({
      projectId: z
        .string()
        .describe('The ID of the project to create the cycle in.'),
      goal: z.string().describe('The goal of the cycle.').optional(),
      startDate: z
        .string()
        .describe('The start date of the cycle in ISO format.')
        .optional(),
      duration: z
        .number()
        .describe('The duration of the cycle in weeks (1-4).')
        .min(1)
        .max(4),
    }),
  })
  async createCycle({
    projectId,
    goal,
    startDate,
    duration,
  }: {
    projectId: string;
    goal?: string;
    startDate?: string;
    duration: 1 | 2 | 3 | 4;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('cycle');
    }
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: org.id },
    });
    try {
      const cycle = await this.cyclesService.create(org.id, project.id, {
        goal: goal || '',
        startDate: startDate
          ? new Date(startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        duration,
      });
      return {
        content: [
          {
            type: 'text',
            text: `Successfully created cycle with title: ${cycle.title}
            Goal: ${cycle.goal}
            Start date: ${cycle.startDate}
            Status: ${cycle.status}
            Cycle ID: ${cycle.id}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to create cycle: ${e.message}`,
          },
        ],
      };
    }
  }
}
