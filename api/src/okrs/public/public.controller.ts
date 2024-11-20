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

@Controller('public/orgs/:orgId/projects/:projectId/okrs')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicOkrsService: PublicService) {}

  @Get('/timeline/:timeline')
  async listObjectives(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicOkrsService.listObjectives(
        orgId,
        projectId,
        timeline,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/:okrId')
  async getObjective(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('okrId') okrId: string,
  ) {
    try {
      return await this.publicOkrsService.getObjective(orgId, projectId, okrId);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/:okrId/key-results/:keyResultId')
  async getKeyResult(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('okrId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
  ) {
    try {
      return await this.publicOkrsService.getKeyResult(
        orgId,
        projectId,
        objectiveId,
        keyResultId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
