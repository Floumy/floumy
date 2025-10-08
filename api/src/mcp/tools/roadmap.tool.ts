import { Inject, Injectable, Scope } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import z from 'zod';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from 'src/projects/project.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { McpService } from '../services/mcp.service';
import { entityNotFound } from '../utils';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { Timeline } from '../../common/timeline.enum';

@Injectable({
  scope: Scope.REQUEST,
})
export class RoadmapTool {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    private mcpService: McpService,
    private milestoneService: MilestonesService,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Tool({
    name: 'find-project-milestones-by-timeline',
    description: 'Find the milestones for a given project.',
    parameters: z.object({
      projectId: z.string().describe('The ID of the project.'),
      timeline: z
        .enum([
          Timeline.PAST,
          Timeline.LATER,
          Timeline.NEXT_QUARTER,
          Timeline.THIS_QUARTER,
        ])
        .describe('The timeline to filter milestones.'),
    }),
  })
  async findProjectMilestonesByTimeline({
    projectId,
    timeline,
  }: {
    projectId: string;
    timeline: string;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: { id: org.id },
    });
    const milestones = await this.milestoneService.listForTimeline(
      org.id,
      project.id,
      timeline as Timeline,
    );
    if (milestones.length === 0) {
      return entityNotFound('milestone');
    }
    return {
      content: milestones.map((milestone) => ({
        type: 'text',
        text: `Title: ${milestone.title}
              ID: ${milestone.id}
              Description: ${milestone.description}
              Due Date: ${milestone.dueDate.toString()}
              `,
      })),
    };
  }

  @Tool({
    name: 'get-milestone-by-id',
    description: 'Get a milestone by its ID.',
    parameters: z.object({
      milestoneId: z.string().describe('The ID of the milestone.'),
      projectId: z.string().describe('The ID of the project.'),
    }),
  })
  async getMilestoneById({
    milestoneId,
    projectId,
  }: {
    milestoneId: string;
    projectId: string;
  }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    const org = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: {
        id: org.id,
      },
    });
    const milestone = await this.milestoneRepository.findOne({
      where: {
        id: milestoneId,
        project: { id: project.id },
        org: { id: org.id },
      },
      relations: ['initiatives'],
    });
    if (!milestone) {
      return entityNotFound('milestone');
    }
    const initiatives = await milestone.initiatives;
    return {
      content: [
        {
          type: 'text',
          text: `Successfully retrieved milestone with ID: ${milestone.id}
          Title: ${milestone.title}
          Description: ${milestone.description}
          Due Date: ${milestone.dueDate.toString()}
          Number of Initiatives: ${initiatives.length}
          Initiatives: ${initiatives
            .map(
              (initiative) => `${initiative.reference} - ${initiative.title}`,
            )
            .join('\n')}`,
        },
      ],
    };
  }
}
