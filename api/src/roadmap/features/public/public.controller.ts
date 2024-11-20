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

@Controller('public/orgs/:orgId/projects/:projectId/features/')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicFeaturesService: PublicService) {}

  @Get('/:featureId')
  async getFeature(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('featureId') featureId: string,
  ) {
    try {
      return await this.publicFeaturesService.getFeature(
        orgId,
        projectId,
        featureId,
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
