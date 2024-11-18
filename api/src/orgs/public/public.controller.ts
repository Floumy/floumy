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

@Controller('public/orgs')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicOrgsService: PublicService) {}

  @Get(':id')
  async getOrg(@Param('id') id: string) {
    try {
      return await this.publicOrgsService.getPublicOrg(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
