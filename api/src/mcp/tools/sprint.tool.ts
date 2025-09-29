import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpService } from '../services/mcp.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Tool } from '@rekog/mcp-nest';
import { entityNotFound } from '../utils';
import z from 'zod';
import { Sprint } from '../../sprints/sprint.entity';
import { SprintsService } from '../../sprints/sprints.service';
import { Project } from '../../projects/project.entity';
import { SprintStatus } from '../../sprints/sprint-status.enum';

@Injectable({
  scope: Scope.REQUEST,
})
export class SprintTool {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    private mcpService: McpService,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private sprintsService: SprintsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Tool({
    name: 'find-active-sprint',
    description: 'Find the current active sprint in a project.',
    parameters: z.object({
      projectId: z.string().describe('The ID of the project.'),
    }),
  })
  async findActiveSprint({ projectId }: { projectId: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('sprint');
    }
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: org.id },
    });
    const sprint = await this.sprintRepository.findOne({
      where: {
        org: { id: org.id },
        project: { id: project.id },
        status: SprintStatus.ACTIVE,
      },
      order: { updatedAt: 'DESC' },
    });
    if (!sprint) {
      return {
        content: [
          {
            type: 'text',
            text: `No active sprint found in project ${project.name}.`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: `Title: ${sprint.title}
          Goal: ${sprint.goal}
          Start date: ${sprint.startDate?.toISOString().split('T')[0]}
          Status: ${sprint.status}
          Sprint ID: ${sprint.id}`,
        },
      ],
    };
  }
  @Tool({
    name: 'find-org-sprints',
    description: 'List latest 10 sprints in the organization.',
  })
  async findOrgSprints() {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('sprint');
    }
    const org = await user.org;
    const sprints = await this.sprintRepository.find({
      where: { org: { id: org.id } },
      order: { startDate: 'DESC' },
      take: 10,
    });
    return {
      content: sprints.map((sprint) => ({
        type: 'text',
        text: `Title: ${sprint.title}
        Goal: ${sprint.goal}
        Status: ${sprint.status}
        Sprint ID: ${sprint.id}`,
      })),
    };
  }

  @Tool({
    name: 'find-project-sprints',
    description: 'List latest 10 sprints in a project.',
    parameters: z.object({
      projectId: z.string().describe('The ID of the project.'),
    }),
  })
  async findProjectSprints({ projectId }: { projectId: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return entityNotFound('sprint');
    }
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: org.id },
    });
    const sprints = await this.sprintRepository.find({
      where: { org: { id: org.id }, project: { id: project.id } },
      order: { startDate: 'DESC' },
      take: 10,
    });
    return {
      content: sprints.map((sprint) => ({
        type: 'text',
        text: `Title: ${sprint.title}
        Goal: ${sprint.goal}
        Status: ${sprint.status}
        Sprint ID: ${sprint.id}`,
      })),
    };
  }
  @Tool({
    name: 'create-sprint',
    description: 'Create a new sprint in a project.',
    parameters: z.object({
      projectId: z
        .string()
        .describe('The ID of the project to create the sprint in.'),
      goal: z.string().describe('The goal of the sprint.').optional(),
      startDate: z
        .string()
        .describe('The start date of the sprint in ISO format.')
        .optional(),
      duration: z
        .number()
        .describe('The duration of the sprint in weeks (1-4).')
        .min(1)
        .max(4),
    }),
  })
  async createSprint({
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
      return entityNotFound('sprint');
    }
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: org.id },
    });
    try {
      const sprint = await this.sprintsService.create(org.id, project.id, {
        goal,
        startDate: startDate ? new Date(startDate).toDateString() : undefined,
        duration,
      });
      return {
        content: [
          {
            type: 'text',
            text: `Successfully created sprint with title: ${sprint.title}
            Goal: ${sprint.goal}
            Start date: ${sprint.startDate}
            Status: ${sprint.status}
            Sprint ID: ${sprint.id}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to create sprint: ${e.message}`,
          },
        ],
      };
    }
  }
}
