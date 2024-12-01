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
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OkrsService } from './okrs.service';
import { AuthGuard } from '../auth/auth.guard';
import { Timeline } from '../common/timeline.enum';
import {
  CreateOrUpdateKeyResultDto,
  CreateOrUpdateOKRDto,
  PatchKeyResultDto,
  UpdateObjectiveDto,
} from './dtos';
import { CommentsService } from './comments/comments.service';
import { CreateUpdateCommentDto } from '../comments/dtos';

@Controller('/orgs/:orgId/projects/:projectId/okrs')
@UseGuards(AuthGuard)
export class OkrsController {
  constructor(
    private readonly okrsService: OkrsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Body() okrDto: CreateOrUpdateOKRDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.create(orgId, projectId, okrDto);
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
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    return await this.okrsService.list(orgId, projectId);
  }

  @Get('key-results')
  @HttpCode(HttpStatus.OK)
  async listKeyResults(@Request() request) {
    const { org: orgId } = request.user;
    return await this.okrsService.listKeyResults(orgId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;
    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.get(orgId, projectId, id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    await this.okrsService.delete(orgId, projectId, id);
  }

  @Patch(':objectiveId/key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async patchKeyResult(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
    @Body() updateKeyResultDto: PatchKeyResultDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.patchKeyResult(
        orgId,
        projectId,
        objectiveId,
        keyResultId,
        updateKeyResultDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put('objective/:objectiveId')
  @HttpCode(HttpStatus.OK)
  async updateObjective(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('objectiveId') objectiveId: string,
    @Request() request,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.updateObjective(
        orgId,
        projectId,
        objectiveId,
        updateObjectiveDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put(':objectiveId/key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async updateKeyResult(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
    @Body() updateKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.updateKeyResult(
        orgId,
        projectId,
        objectiveId,
        keyResultId,
        updateKeyResultDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete(':objectiveId/key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async deleteKeyResult(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    await this.okrsService.deleteKeyResult(
      orgId,
      projectId,
      objectiveId,
      keyResultId,
    );
  }

  @Post(':objectiveId/key-results')
  @HttpCode(HttpStatus.CREATED)
  async createKeyResult(
    @Param('objectiveId') objectiveId: string,
    @Request() request,
    @Body() createKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    const { org: orgId } = request.user;
    try {
      return await this.okrsService.createKeyResult(
        orgId,
        objectiveId,
        createKeyResultDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get(':objectiveId/key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async getKeyResult(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.getKeyResultDetail(
        orgId,
        projectId,
        objectiveId,
        keyResultId,
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Get('timeline/:timeline')
  async listForTimeline(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('timeline') timeline: Timeline,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    return await this.okrsService.listForTimeline(orgId, projectId, timeline);
  }

  @Post('/key-results/:keyResultId/comments')
  @HttpCode(HttpStatus.OK)
  async addCommentToKeyResult(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.addCommentToKeyResult(
        orgId,
        projectId,
        keyResultId,
        request.user.sub,
        commentDto.content,
        commentDto.mentions,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put('/key-results/:keyResultId/comments/:commentId')
  async updateKeyResultComment(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('commentId') commentId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.updateKeyResultComment(
        orgId,
        projectId,
        request.user.sub,
        commentId,
        commentDto.content,
        commentDto.mentions,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete('/key-results/:keyResultId/comments/:commentId')
  async deleteKeyResultComment(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('commentId') commentId: string,
    @Request() request,
  ) {
    try {
      return await this.commentsService.deleteKeyResultComment(
        orgId,
        projectId,
        request.user.sub,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Post(':objectiveId/comments')
  @HttpCode(HttpStatus.CREATED)
  async addCommentToObjective(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('objectiveId') objectiveId: string,
    @Request() resquest,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.addCommentToObjective(
        orgId,
        projectId,
        objectiveId,
        resquest.user.sub,
        commentDto.content,
        commentDto.mentions,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put(':objectiveId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  async updateObjectiveComment(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('commentId') commentId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.updateObjectiveComment(
        orgId,
        projectId,
        request.user.sub,
        commentId,
        commentDto.content,
        commentDto.mentions,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete(':objectiveId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  async deleteObjectiveComment(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('commentId') commentId: string,
    @Request() request,
  ) {
    try {
      return await this.commentsService.deleteObjectiveComment(
        orgId,
        projectId,
        request.user.sub,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
