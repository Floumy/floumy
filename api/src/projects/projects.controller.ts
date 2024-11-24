import { BadRequestException, Controller, Get, Param, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orgs/:orgId/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {
  }

  @UseGuards(AuthGuard)
  @Get()
  async listProjects(@Request() request, @Param('orgId') orgId: string) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.projectsService.listProjects(orgId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
