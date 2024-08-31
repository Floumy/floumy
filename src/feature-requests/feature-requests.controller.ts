import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateFeatureRequestDto, UpdateFeatureRequestDto } from './dtos';
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

  @Get(':featureRequestId')
  @Public()
  async getFeatureRequestById(
    @Param('orgId') orgId: string,
    @Param('featureRequestId') featureRequestId: string,
  ) {
    try {
      return await this.featureRequestsService.getFeatureRequestById(
        orgId,
        featureRequestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':featureRequestId')
  @UseGuards(AuthGuard)
  async updateFeatureRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('featureRequestId') featureRequestId: string,
    @Body() updateFeatureRequestDto: UpdateFeatureRequestDto,
  ) {
    try {
      return await this.featureRequestsService.updateFeatureRequest(
        request.user.sub,
        orgId,
        featureRequestId,
        updateFeatureRequestDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':featureRequestId')
  @UseGuards(AuthGuard)
  async deleteFeatureRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('featureRequestId') featureRequestId: string,
  ) {
    try {
      return await this.featureRequestsService.deleteFeatureRequest(
        request.user.sub,
        orgId,
        featureRequestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
