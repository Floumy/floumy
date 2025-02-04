import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../../auth/public.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('public/orgs/:orgId/projects/:projectId/initiatives/')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicInitiativesService: PublicService) {}

  @Get('/:initiativeId')
  async getFeature(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('initiativeId') initiativeId: string,
  ) {
    try {
      return await this.publicInitiativesService.getInitiative(
        orgId,
        projectId,
        initiativeId,
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
