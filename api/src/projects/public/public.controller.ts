import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ProjectDto } from './dtos';
import { Public } from '../../auth/public.guard';

@Controller('public/orgs/:orgId/projects/')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicProjectsService: PublicService) {}

  @Get('/:projectId')
  async getProject(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ): Promise<ProjectDto> {
    try {
      return await this.publicProjectsService.getProject(orgId, projectId);
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
