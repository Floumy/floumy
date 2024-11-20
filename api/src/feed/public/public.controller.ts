import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Public()
@UseInterceptors(CacheInterceptor)
@Controller('public/orgs/:orgId/projects/:projectId/feed')
export class PublicController {
  constructor(private readonly publicFeedService: PublicService) {}

  @Get()
  async listFeedItems(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.publicFeedService.listFeedItems(
      orgId,
      projectId,
      page,
      limit,
    );
  }
}
