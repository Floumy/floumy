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
  Patch,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { WorkItemsService } from './work-items.service';
import { CreateUpdateWorkItemDto, WorkItemDto, WorkItemPatchDto } from './dtos';
import { CreateUpdateCommentDto } from '../../comments/dtos';
import { Public } from '../../auth/public.guard';

@Controller('/orgs/:orgId/projects/:projectId/work-items')
@UseGuards(AuthGuard)
export class WorkItemsController {
  constructor(private workItemsService: WorkItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Body() workItemDto: CreateUpdateWorkItemDto,
  ): Promise<WorkItemDto> {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.workItemsService.createWorkItem(
        orgId,
        projectId,
        request.user.sub,
        workItemDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.workItemsService.listWorkItems(
        orgId,
        projectId,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
    @Query('f') filters?: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.workItemsService.searchWorkItems(
        orgId,
        projectId,
        query,
        page,
        limit,
        filters ? JSON.parse(filters) : undefined,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('open')
  @HttpCode(HttpStatus.OK)
  async listOpenWithoutIterations(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.workItemsService.listOpenWorkItemsWithoutIterations(
      orgId,
      projectId,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
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
      return await this.workItemsService.getWorkItem(orgId, projectId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
    @Body() workItemDto: CreateUpdateWorkItemDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.workItemsService.updateWorkItem(
        request.user.sub,
        orgId,
        projectId,
        id,
        workItemDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
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
      await this.workItemsService.deleteWorkItem(orgId, projectId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patch(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
    @Body() workItemDto: WorkItemPatchDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.workItemsService.patchWorkItem(
        orgId,
        projectId,
        id,
        workItemDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':id/comments')
  async createComment(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
    @Body() createCommentDto: CreateUpdateCommentDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.workItemsService.createWorkItemComment(
        request.user.sub,
        orgId,
        projectId,
        id,
        createCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id/comments')
  @Public()
  async listComments(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.workItemsService.listWorkItemComments(
        orgId,
        projectId,
        id,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id/comments/:commentId')
  async deleteComment(
    @Request() request,
    @Param('id') workItemId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      await this.workItemsService.deleteWorkItemComment(
        request.user.sub,
        workItemId,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':id/comments/:commentId')
  async updateComment(
    @Request() request,
    @Param('id') workItemId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.workItemsService.updateWorkItemComment(
        request.user.sub,
        workItemId,
        commentId,
        updateCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
