import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { Timeline } from '../../../common/timeline.enum';
import { Public } from '../../../auth/public.guard';

@Controller('orgs/:orgId/milestones')
@Public()
export class PublicController {
  constructor(private publicMilestonesService: PublicService) {}

  @Get('/timeline/:timeline')
  async listMilestones(
    @Param('orgId') orgId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicMilestonesService.listMilestones(orgId, timeline);
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
