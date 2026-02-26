import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('public/orgs/:orgId/projects/:projectId/cycles')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicCyclesService: PublicService) {}

  @Get('/timeline/:timeline')
  async listCyclesForTimeline(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicCyclesService.listCyclesForTimeline(
        orgId,
        projectId,
        timeline,
      );
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException();
    }
  }

  @Get('/active')
  async getActiveCycle(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.publicCyclesService.getActiveCycle(orgId, projectId);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException();
    }
  }

  @Get('/:cycleId')
  async getCycleById(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('cycleId') cycleId: string,
  ) {
    try {
      return await this.publicCyclesService.getCycleById(
        orgId,
        projectId,
        cycleId,
      );
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException();
    }
  }
}
