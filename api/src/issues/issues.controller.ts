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
  UseGuards,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { AuthGuard } from '../auth/auth.guard';
import { IssueDto, UpdateIssueDto } from './dtos';
import { Public } from '../auth/public.guard';
import { CreateUpdateCommentDto } from '../comments/dtos';

@Controller('/orgs/:orgId/products/:productId/issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async addIssue(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Body() issueDto: IssueDto,
  ) {
    try {
      return await this.issuesService.addIssue(
        request.user.sub,
        orgId,
        productId,
        issueDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Public()
  async listIssues(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      return await this.issuesService.listIssues(orgId, productId, page, limit);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      return await this.issuesService.searchIssues(
        orgId,
        productId,
        query,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get(':issueId')
  @HttpCode(HttpStatus.OK)
  @Public()
  async getIssueById(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('issueId') issueId: string,
  ) {
    try {
      return await this.issuesService.getIssueById(orgId, productId, issueId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':issueId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateIssue(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('issueId') issueId: string,
    @Body() issueDto: UpdateIssueDto,
  ) {
    try {
      return await this.issuesService.updateIssue(
        request.user.sub,
        orgId,
        productId,
        issueId,
        issueDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':issueId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteIssue(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('issueId') issueId: string,
  ) {
    try {
      return await this.issuesService.deleteIssue(
        request.user.sub,
        orgId,
        productId,
        issueId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':issueId/comments')
  @UseGuards(AuthGuard)
  async addIssueComment(
    @Request() request,
    @Param('issueId') issueId: string,
    @Body() createCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.issuesService.createIssueComment(
        request.user.sub,
        issueId,
        createCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':issueId/comments/:commentId')
  @UseGuards(AuthGuard)
  async updateIssueComment(
    @Request() request,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.issuesService.updateIssueComment(
        request.user.sub,
        issueId,
        commentId,
        updateCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':issueId/comments/:commentId')
  @UseGuards(AuthGuard)
  async deleteIssueComment(
    @Request() request,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      return await this.issuesService.deleteIssueComment(
        request.user.sub,
        issueId,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
