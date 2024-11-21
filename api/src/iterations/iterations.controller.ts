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
import { CreateOrUpdateIterationDto } from './dtos';
import { IterationsService } from './iterations.service';
import { Timeline } from '../common/timeline.enum';

@Controller('/orgs/:orgId/projects/:projectId/iterations')
@UseGuards(AuthGuard)
export class IterationsController {
  constructor(private iterationsService: IterationsService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Body() body: CreateOrUpdateIterationDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.iterationsService.create(orgId, projectId, body);
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

    return await this.iterationsService.listWithWorkItems(orgId, projectId);
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

    return await this.iterationsService.list(orgId, projectId);
  }

  @Post(':id/start')
  @HttpCode(200)
  async startIteration(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.iterationsService.startIteration(orgId, projectId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('active')
  @HttpCode(200)
  async getActiveIteration(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.iterationsService.getActiveIteration(orgId, projectId);
  }

  @Post(':id/complete')
  @HttpCode(200)
  async completeIteration(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.iterationsService.completeIteration(
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
      return await this.iterationsService.get(orgId, projectId, id);
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
    @Body() body: CreateOrUpdateIterationDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.iterationsService.update(orgId, projectId, id, body);
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
      return await this.iterationsService.delete(orgId, projectId, id);
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

    return await this.iterationsService.listForTimeline(
      orgId,
      projectId,
      timeline,
    );
  }
}
