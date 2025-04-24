import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
    @Body() createProjectDto: { name: string; description?: string },
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

  @Put(':id')
  @HttpCode(200)
  async updateProject(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateProjectDto: { name: string; description?: string },
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.projectsService.updateProject(
        orgId,
        id,
        updateProjectDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  @HttpCode(200)
  async getProject(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.projectsService.findOneById(orgId, id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteProject(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.projectsService.deleteProject(orgId, id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
