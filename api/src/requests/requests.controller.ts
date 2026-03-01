import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateRequestDto, UpdateRequestDto } from './dtos';
import { RequestsService } from './requests.service';
import { AuthGuard } from '../auth/auth.guard';
import { RequestVoteService } from './request-votes.service';
import type { CreateUpdateCommentDto } from '../comments/dtos';

@Controller('orgs/:orgId/projects/:projectId/requests')
export class RequestsController {
  constructor(
    private requestsService: RequestsService,
    private requestVoteService: RequestVoteService,
  ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async search(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.requestsService.searchRequestsByTitleOrDescription(
        orgId,
        projectId,
        query,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('my-votes')
  @UseGuards(AuthGuard)
  async getMyVotes(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.requestVoteService.getVotes(
        request.user.sub,
        orgId,
        projectId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async addRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    try {
      return await this.requestsService.addRequest(
        request.user.sub,
        orgId,
        projectId,
        createRequestDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async listRequests(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.requestsService.listRequests(
        orgId,
        projectId,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':requestId')
  @UseGuards(AuthGuard)
  async getRequestById(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.requestsService.getRequestById(
        orgId,
        projectId,
        requestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':requestId')
  @UseGuards(AuthGuard)
  async updateRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    try {
      return await this.requestsService.updateRequest(
        request.user.sub,
        orgId,
        projectId,
        requestId,
        updateRequestDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':requestId')
  @UseGuards(AuthGuard)
  async deleteRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
  ) {
    try {
      return await this.requestsService.deleteRequest(
        request.user.sub,
        orgId,
        projectId,
        requestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':requestId/upvote')
  @UseGuards(AuthGuard)
  async upvoteRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
  ) {
    try {
      return await this.requestVoteService.upvoteRequest(
        request.user.sub,
        orgId,
        projectId,
        requestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':requestId/downvote')
  @UseGuards(AuthGuard)
  async downvoteRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
  ) {
    try {
      return await this.requestVoteService.downvoteRequest(
        request.user.sub,
        orgId,
        projectId,
        requestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':requestId/comments')
  @UseGuards(AuthGuard)
  async addRequestComment(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
    @Body() createCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.requestsService.createRequestComment(
        orgId,
        projectId,
        request.user.sub,
        requestId,
        createCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':requestId/comments/:commentId')
  @UseGuards(AuthGuard)
  async updateRequestComment(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Param('requestId') requestId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.requestsService.updateRequestComment(
        orgId,
        projectId,
        request.user.sub,
        requestId,
        commentId,
        updateCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':requestId/comments/:commentId')
  @UseGuards(AuthGuard)
  async deleteRequestComment(
    @Param('orgId') orgId: string,
    @Request() request,
    @Param('requestId') requestId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      return await this.requestsService.deleteRequestComment(
        orgId,
        request.user.sub,
        requestId,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
