import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateOrUpdateSprintDto } from './dtos';
import { SprintsService } from './sprints.service';
import { Timeline } from '../common/timeline.enum';

@Controller('/orgs/:orgId/projects/:projectId/sprints')
@UseGuards(AuthGuard)
export class SprintsController {
  constructor(private sprintsService: SprintsService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Body() body: CreateOrUpdateSprintDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.sprintsService.create(orgId, projectId, body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('with-work-items')
  @HttpCode(200)
  async listWithWorkItems(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.sprintsService.listWithWorkItems(orgId, projectId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.sprintsService.list(orgId, projectId);
  }

  @Post(':id/start')
  @HttpCode(200)
  async startSprint(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.sprintsService.startSprint(orgId, projectId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('active')
  @HttpCode(200)
  async getActiveSprint(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.sprintsService.getActiveSprint(orgId, projectId);
  }

  @Post(':id/complete')
  @HttpCode(200)
  async completeSprint(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.sprintsService.completeSprint(
        orgId,
        projectId,
        id,
      );
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get(':id')
  @HttpCode(200)
  async get(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.sprintsService.get(orgId, projectId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(':id')
  @HttpCode(200)
  async update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
    @Body() body: CreateOrUpdateSprintDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.sprintsService.update(orgId, projectId, id, body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.sprintsService.delete(orgId, projectId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('timeline/:timeline')
  async listForTimeline(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('timeline') timeline: Timeline,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.sprintsService.listForTimeline(
      orgId,
      projectId,
      timeline,
    );
  }
}
