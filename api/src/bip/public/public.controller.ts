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

@Controller('/build-in-public/org/:orgId')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicBipService: PublicService) {}

  @Get('settings')
  async getPublicSettings(@Param('orgId') orgId: string) {
    try {
      return await this.publicBipService.getPublicSettings(orgId);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
