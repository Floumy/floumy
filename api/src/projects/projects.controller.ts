import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orgs/:orgId/my-projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

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

  @Post()
  @HttpCode(201)
  async createProject(
    @Request() request,
    @Body() createProjectDto: { name: string },
    @Param('orgId') orgId: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.projectsService.createProject(
        request.user.sub,
        orgId,
        createProjectDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
