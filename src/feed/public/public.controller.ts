import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Public()
@UseInterceptors(CacheInterceptor)
@Controller('orgs/:orgId/feed')
export class PublicController {
  constructor(private readonly publicFeedService: PublicService) {}

  @Get()
  async listFeedItems(
    @Param('orgId') orgId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.publicFeedService.listFeedItems(orgId, page, limit);
  }
}
