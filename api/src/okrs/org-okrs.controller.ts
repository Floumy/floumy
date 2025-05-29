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
import { AuthGuard } from '../auth/auth.guard';
import { CommentsService } from './comments/comments.service';
import {
  CreateOrUpdateKeyResultDto,
  CreateOrUpdateOKRDto,
  PatchKeyResultDto,
  UpdateObjectiveDto,
} from './dtos';
import { Timeline } from '../common/timeline.enum';
import { CreateUpdateCommentDto } from '../comments/dtos';
import { OrgOkrsService } from './org-okrs.service';

@Controller('/orgs/:orgId/')
@UseGuards(AuthGuard)
export class OrgOkrsController {
  constructor(
    private readonly okrsService: OrgOkrsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post('okrs')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('orgId') orgId: string,
    @Request() request,
    @Body() okrDto: CreateOrUpdateOKRDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.create(orgId, okrDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('okrs')
  @HttpCode(HttpStatus.OK)
  async list(@Param('orgId') orgId: string, @Request() request) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    return await this.okrsService.list(orgId);
  }

  @Get('key-results')
  @HttpCode(HttpStatus.OK)
  async listKeyResults(@Request() request, @Param('orgId') orgId: string) {
    const { org } = request.user;

    if (org !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.okrsService.listKeyResults(orgId);
  }

  @Get('okrs/:id')
  @HttpCode(HttpStatus.OK)
  async get(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;
    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.get(orgId, id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Delete('okrs/:id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    await this.okrsService.delete(orgId, id);
  }

  @Patch('key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async patchKeyResult(
    @Param('orgId') orgId: string,
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
        objectiveId,
        keyResultId,
        updateKeyResultDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put('okrs/objective/:objectiveId')
  @HttpCode(HttpStatus.OK)
  async updateObjective(
    @Param('orgId') orgId: string,
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
        objectiveId,
        updateObjectiveDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put('key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async updateKeyResult(
    @Param('orgId') orgId: string,
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
        objectiveId,
        keyResultId,
        updateKeyResultDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete('key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async deleteKeyResult(
    @Param('orgId') orgId: string,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    await this.okrsService.deleteKeyResult(orgId, objectiveId, keyResultId);
  }

  @Post('okrs/:objectiveId/key-results')
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

  @Get('key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async getKeyResult(
    @Param('orgId') orgId: string,
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
        objectiveId,
        keyResultId,
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Get('okrs/timeline/:timeline')
  async listForTimeline(
    @Param('orgId') orgId: string,
    @Request() request,
    @Param('timeline') timeline: Timeline,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    return await this.okrsService.listForTimeline(orgId, timeline);
  }

  @Post('/key-results/:keyResultId/comments')
  @HttpCode(HttpStatus.OK)
  async addCommentToKeyResult(
    @Param('orgId') orgId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.addCommentToKeyResult(
        orgId,
        null,
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
    @Param('commentId') commentId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.updateKeyResultComment(
        orgId,
        null,
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
    @Param('commentId') commentId: string,
    @Request() request,
  ) {
    try {
      return await this.commentsService.deleteKeyResultComment(
        orgId,
        null,
        request.user.sub,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Post('okrs/:objectiveId/comments')
  @HttpCode(HttpStatus.CREATED)
  async addCommentToObjective(
    @Param('orgId') orgId: string,
    @Param('objectiveId') objectiveId: string,
    @Request() resquest,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.addCommentToObjective(
        orgId,
        null,
        objectiveId,
        resquest.user.sub,
        commentDto.content,
        commentDto.mentions,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put('okrs/:objectiveId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  async updateObjectiveComment(
    @Param('orgId') orgId: string,
    @Param('commentId') commentId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.updateObjectiveComment(
        orgId,
        null,
        request.user.sub,
        commentId,
        commentDto.content,
        commentDto.mentions,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete('okrs/:objectiveId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  async deleteObjectiveComment(
    @Param('orgId') orgId: string,
    @Param('commentId') commentId: string,
    @Request() request,
  ) {
    try {
      return await this.commentsService.deleteObjectiveComment(
        orgId,
        null,
        request.user.sub,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('okrs-stats/timeline/:timeline')
  @HttpCode(HttpStatus.OK)
  async getOkrStats(
    @Param('orgId') orgId: string,
    @Param('timeline') timeline: Timeline,
    @Request() request: any,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.getStats(orgId, timeline);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
