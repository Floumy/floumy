import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';

@Controller('orgs/:orgId/iterations')
@Public()
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

  @Get('/:iterationId')
  async getIterationById(
    @Param('orgId') orgId: string,
    @Param('iterationId') iterationId: string,
  ) {
    try {
      return await this.publicIterationsService.getIterationById(
        orgId,
        iterationId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
