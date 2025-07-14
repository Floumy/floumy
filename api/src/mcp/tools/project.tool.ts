import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../projects/project.entity';
import { McpService } from '../services/mcp.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

@Injectable({
  scope: Scope.REQUEST,
})
export class ProjectTool {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private mcpService: McpService,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Tool({
    name: 'find-project-by-name',
    description:
      'Find a project in the system based on its name. The name is case-insensitive.',
    parameters: z.object({
      name: z.string().describe('The project name.'),
    }),
  })
  async findProjectByName({ name }: { name: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return { error: 'User not found' };
    }

    const org = await user.org;
    const project = await this.projectRepository.findOne({
      where: { name: name.toLowerCase(), org: { id: org.id } },
    });

    if (!project) {
      return { error: 'Project not found' };
    }

    return {
      content: [
        {
          type: 'text',
          text: `ProjectID: ${project.id}\nProject Name: ${project.name}\nDescription: ${project.description}`,
        },
      ],
    };
  }

  @Tool({
    name: 'list-projects',
    description: 'List all projects in the organization.',
  })
  async listProjects() {
    const user = await this.mcpService.getUserFromRequest(this.request);
    if (!user) {
      return { error: 'User not found' };
    }

    const org = await user.org;
    const projects = await this.projectRepository.find({
      where: { org: { id: org.id } },
      order: { name: 'ASC' },
    });

    if (projects.length === 0) {
      return { content: [{ type: 'text', text: 'No projects found.' }] };
    }

    return {
      content: projects.map((project) => ({
        type: 'text',
        text: `ProjectID: ${project.id}\nProject Name: ${project.name}\nDescription: ${project.description}`,
      })),
    };
  }
}
