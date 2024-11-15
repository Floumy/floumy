import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('public/orgs/:orgId/products/:productId/work-items')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private workItemsPublicService: PublicService) {}

  @Get('/:workItemId')
  async getWorkItem(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('workItemId') workItemId: string,
  ) {
    try {
      return await this.workItemsPublicService.getWorkItem(
        orgId,
        productId,
        workItemId,
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
