import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Public } from '../../auth/public.guard';
import { BipService } from '../../bip/bip.service';
import { RequestsService } from '../requests.service';

@Controller('/public/orgs/:orgId/projects/:projectId/requests')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(
    private requestsService: RequestsService,
    private bipService: BipService,
  ) {}

  @Get('/search')
  async search(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      await this.bipService.validatePageAccess(orgId, projectId, 'requests');
      return await this.requestsService.searchRequestsByTitleOrDescription(
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

  @Get()
  async listRequests(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      await this.bipService.validatePageAccess(orgId, projectId, 'requests');
      return await this.requestsService.listRequests(
        orgId,
        projectId,
        page,
        limit,
      );
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message);
    }
  }

  @Get(':requestId')
  async getRequestById(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
  ) {
    try {
      await this.bipService.validatePageAccess(orgId, projectId, 'requests');
      return await this.requestsService.getRequestById(
        orgId,
        projectId,
        requestId,
      );
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message);
    }
  }
}
