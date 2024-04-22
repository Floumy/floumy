import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';

@Controller('orgs/:orgId/okrs')
@Public()
export class PublicController {
  constructor(private publicOkrsService: PublicService) {}

  @Get('/timeline/:timeline')
  async listObjectives(
    @Param('orgId') orgId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicOkrsService.listObjectives(orgId, timeline);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
