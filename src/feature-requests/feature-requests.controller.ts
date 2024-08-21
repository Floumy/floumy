import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateFeatureRequestDto } from './dtos';
import { FeatureRequestsService } from './feature-requests.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orgs/:orgId/feature-requests')
@UseGuards(AuthGuard)
export class FeatureRequestsController {
  constructor(private featureRequestsService: FeatureRequestsService) {}

  @Post()
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
}
