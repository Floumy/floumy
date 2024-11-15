import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { Timeline } from '../../../common/timeline.enum';
import { Public } from '../../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('public/orgs/:orgId/products/:productId/milestones')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicMilestonesService: PublicService) {}

  @Get('/timeline/:timeline')
  async listMilestones(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicMilestonesService.listMilestones(
        orgId,
        productId,
        timeline,
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Get('/:milestoneId')
  async findMilestone(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    try {
      return await this.publicMilestonesService.findMilestone(
        orgId,
        productId,
        milestoneId,
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
