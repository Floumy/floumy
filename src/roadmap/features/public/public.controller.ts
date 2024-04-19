import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../../auth/public.guard';

@Controller('orgs/:orgId/features/')
@Public()
export class PublicController {
  constructor(private publicFeaturesService: PublicService) {}

  @Get('/:featureId')
  async getFeature(
    @Param('orgId') orgId: string,
    @Param('featureId') featureId: string,
  ) {
    try {
      return await this.publicFeaturesService.getFeature(orgId, featureId);
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
