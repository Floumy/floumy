import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('/orgs/:orgId/products/:productId/build-in-public')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicBipService: PublicService) {}

  @Get('settings')
  async getPublicSettings(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
  ) {
    try {
      return await this.publicBipService.getPublicSettings(orgId, productId);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
