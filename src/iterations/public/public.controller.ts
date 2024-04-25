import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';

@Controller('orgs/:orgId/iterations')
export class PublicController {
  constructor(private publicIterationsService: PublicService) {}

  @Get('/timeline/:timeline')
  async listIterationsForTimeline(
    @Param('orgId') orgId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicIterationsService.listIterationsForTimeline(
        orgId,
        timeline,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
