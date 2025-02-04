import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InitiativesService } from './initiatives.service';
import { CreateUpdateInitiativeDto, PatchInitiativeDto } from './dtos';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateUpdateCommentDto } from '../../comments/dtos';
import { Public } from '../../auth/public.guard';

@Controller('/orgs/:orgId/projects/:projectId/initiatives')
@UseGuards(AuthGuard)
export class InitiativesController {
  constructor(private initiativesService: InitiativesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Body() initiativeDto: CreateUpdateInitiativeDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.initiativesService.createInitiative(
        orgId,
        projectId,
        request.user.sub,
        initiativeDto,
      );
    } catch (e) {
      throw new BadRequestException();
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
      const { org: orgId } = request.user;
      return await this.initiativesService.listInitiatives(
        orgId,
        projectId,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request: any,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
    @Query('f') filters?: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      const { org: orgId } = request.user;
      return await this.initiativesService.searchInitiatives(
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

  @Get('/without-milestone')
  @HttpCode(HttpStatus.OK)
  async listWithoutMilestone(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      const { org: orgId } = request.user;
      return await this.initiativesService.listInitiativesWithoutMilestone(
        orgId,
        projectId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
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
      const { org: orgId } = request.user;
      return await this.initiativesService.getInitiative(orgId, projectId, id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
    @Body() updateInitiativeDto: CreateUpdateInitiativeDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      const { org: orgId } = request.user;
      return await this.initiativesService.updateInitiative(
        request.user.sub,
        orgId,
        projectId,
        id,
        updateInitiativeDto,
      );
    } catch (e) {
      throw new BadRequestException();
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
      const { org: orgId } = request.user;
      await this.initiativesService.deleteInitiative(orgId, projectId, id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patch(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('id') id: string,
    @Body() patchInitiativeDto: PatchInitiativeDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      const { org: orgId } = request.user;
      return await this.initiativesService.patchInitiative(
        orgId,
        projectId,
        id,
        patchInitiativeDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Post(':id/comments')
  async addComment(
    @Request() request,
    @Param('id') id: string,
    @Body() createCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.initiativesService.createInitiativeComment(
        request.user.sub,
        id,
        createCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id/comments')
  @Public()
  async listComments(@Param('id') id: string) {
    try {
      return await this.initiativesService.listInitiativeComments(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id/comments/:commentId')
  async deleteComment(
    @Request() request,
    @Param('id') initiativeId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      await this.initiativesService.deleteInitiativeComment(
        request.user.sub,
        initiativeId,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':id/comments/:commentId')
  async updateComment(
    @Request() request,
    @Param('id') initiativeId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.initiativesService.updateInitiativeComment(
        request.user.sub,
        initiativeId,
        commentId,
        updateCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Patch(':id/assignee')
  async changeAssignee(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() assignee: { assignee: string },
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      await this.initiativesService.changeAssignee(
        orgId,
        projectId,
        id,
        assignee.assignee,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
