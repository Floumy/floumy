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

@Controller('okrs')
@UseGuards(AuthGuard)
export class OkrsController {
  constructor(
    private okrsService: OkrsService,
    private commentsService: CommentsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() okrDto: CreateOrUpdateOKRDto) {
    const { org: orgId } = request.user;
    try {
      return await this.okrsService.create(orgId, okrDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    const { org: orgId } = request.user;
    return await this.okrsService.list(orgId);
  }

  @Get('key-results')
  @HttpCode(HttpStatus.OK)
  async listKeyResults(@Request() request) {
    const { org: orgId } = request.user;
    return await this.okrsService.listKeyResults(orgId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string, @Request() request) {
    const { org: orgId } = request.user;
    try {
      return await this.okrsService.get(orgId, id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Request() request) {
    const { org: orgId } = request.user;
    await this.okrsService.delete(orgId, id);
  }

  @Patch(':objectiveId/key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async patchKeyResult(
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
    @Body() updateKeyResultDto: PatchKeyResultDto,
  ) {
    const { org: orgId } = request.user;
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

  @Put('objective/:objectiveId')
  @HttpCode(HttpStatus.OK)
  async updateObjective(
    @Param('objectiveId') objectiveId: string,
    @Request() request,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    const { org: orgId } = request.user;
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

  @Put(':objectiveId/key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async updateKeyResult(
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
    @Body() updateKeyResultDto: CreateOrUpdateKeyResultDto,
  ) {
    const { org: orgId } = request.user;
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

  @Delete(':objectiveId/key-results/:keyResultId')
  @HttpCode(HttpStatus.OK)
  async deleteKeyResult(
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
  ) {
    const { org: orgId } = request.user;
    await this.okrsService.deleteKeyResult(orgId, objectiveId, keyResultId);
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
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Request() request,
  ) {
    const { org: orgId } = request.user;
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

  @Get('timeline/:timeline')
  async listForTimeline(
    @Request() request,
    @Param('timeline') timeline: Timeline,
  ) {
    return await this.okrsService.listForTimeline(request.user.org, timeline);
  }

  @Post('/key-results/:keyResultId/comments')
  @HttpCode(HttpStatus.OK)
  async addCommentToKeyResult(
    @Param('keyResultId') keyResultId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.addCommentToKeyResult(
        keyResultId,
        request.user.sub,
        commentDto.content,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put('/key-results/:keyResultId/comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Request() request,
    @Body() commentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.commentsService.updateComment(
        request.user.sub,
        commentId,
        commentDto.content,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete('/key-results/:keyResultId/comments/:commentId')
  deleteComment(@Param('commentId') commentId: string, @Request() request) {
    try {
      return this.commentsService.deleteComment(request.user.sub, commentId);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
