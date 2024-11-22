import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orgs/:orgId/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listProjects(@Param('orgId') orgId: string) {
    return await this.projectsService.listProjects(orgId);
  }
}
