import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FeaturesService } from './features.service';
import { CreateUpdateFeatureDto, PatchFeatureDto } from './dtos';
import { AuthGuard } from '../../auth/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('features')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class FeaturesController {
  constructor(private featuresService: FeaturesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() featureDto: CreateUpdateFeatureDto) {
    try {
      return await this.featuresService.createFeature(
        request.user.sub,
        featureDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.listFeatures(orgId);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/without-milestone')
  @HttpCode(HttpStatus.OK)
  async listWithoutMilestone(@Request() request) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.listFeaturesWithoutMilestone(orgId);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Request() request, @Param('id') id: string) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.getFeature(orgId, id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() request,
    @Param('id') id: string,
    @Body() updateFeatureDto: CreateUpdateFeatureDto,
  ) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.updateFeature(
        orgId,
        id,
        updateFeatureDto,
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Request() request, @Param('id') id: string) {
    try {
      const { org: orgId } = request.user;
      await this.featuresService.deleteFeature(orgId, id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patch(
    @Request() request,
    @Param('id') id: string,
    @Body() patchFeatureDto: PatchFeatureDto,
  ) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.patchFeature(
        orgId,
        id,
        patchFeatureDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
