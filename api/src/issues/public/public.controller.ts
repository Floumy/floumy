import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Public } from '../../auth/public.guard';
import { BipService } from '../../bip/bip.service';
import { IssuesService } from '../issues.service';

@Controller('/public/orgs/:orgId/projects/:projectId/issues')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(
    private issuesService: IssuesService,
    private bipService: BipService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async listIssues(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      await this.bipService.validatePageAccess(orgId, projectId, 'issues');
      return await this.issuesService.listIssues(orgId, projectId, page, limit);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message);
    }
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      await this.bipService.validatePageAccess(orgId, projectId, 'issues');
      return await this.issuesService.searchIssues(
        orgId,
        projectId,
        query,
        page,
        limit,
      );
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message);
    }
  }

  @Get(':issueId')
  @HttpCode(HttpStatus.OK)
  async getIssueById(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
  ) {
    try {
      await this.bipService.validatePageAccess(orgId, projectId, 'issues');
      return await this.issuesService.getIssueById(orgId, projectId, issueId);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message);
    }
  }
}
