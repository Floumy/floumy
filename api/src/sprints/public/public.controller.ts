import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('public/orgs/:orgId/projects/:projectId/sprints')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicSprintsService: PublicService) {}

  @Get('/timeline/:timeline')
  async listSprintsForTimeline(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicSprintsService.listSprintsForTimeline(
        orgId,
        projectId,
        timeline,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/active')
  async getActiveSprint(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.publicSprintsService.getActiveSprint(orgId, projectId);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/:sprintId')
  async getSprintById(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    try {
      return await this.publicSprintsService.getSprintById(
        orgId,
        projectId,
        sprintId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
