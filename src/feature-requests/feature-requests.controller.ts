import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateFeatureRequestDto } from './dtos';
import { FeatureRequestsService } from './feature-requests.service';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/public.guard';

@Controller('orgs/:orgId/feature-requests')
export class FeatureRequestsController {
  constructor(private featureRequestsService: FeatureRequestsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async addFeatureRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Body() createFeatureRequestDto: CreateFeatureRequestDto,
  ) {
    try {
      return await this.featureRequestsService.addFeatureRequest(
        request.user.sub,
        orgId,
        createFeatureRequestDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @Public()
  async listFeatureRequests(
    @Param('orgId') orgId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      return await this.featureRequestsService.listFeatureRequests(
        orgId,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
