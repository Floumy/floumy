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

@Controller('public/orgs/:orgId/products/:productId/iterations')
@Public()
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicIterationsService: PublicService) {}

  @Get('/timeline/:timeline')
  async listIterationsForTimeline(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('timeline') timeline: Timeline,
  ) {
    try {
      return await this.publicIterationsService.listIterationsForTimeline(
        orgId,
        productId,
        timeline,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/active')
  async getActiveIteration(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
  ) {
    try {
      return await this.publicIterationsService.getActiveIteration(
        orgId,
        productId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/:iterationId')
  async getIterationById(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('iterationId') iterationId: string,
  ) {
    try {
      return await this.publicIterationsService.getIterationById(
        orgId,
        productId,
        iterationId,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
