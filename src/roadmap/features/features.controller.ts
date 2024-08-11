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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeaturesService } from './features.service';
import { CreateUpdateFeatureDto, PatchFeatureDto } from './dtos';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateUpdateCommentDto } from '../../comments/dtos';
import { Public } from '../../auth/public.guard';

@Controller('features')
@UseGuards(AuthGuard)
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
  async list(
    @Request() request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.listFeatures(orgId, page, limit);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Request() request,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.searchFeatures(
        orgId,
        query,
        page,
        limit,
      );
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

  @Post(':id/comments')
  async addComment(
    @Request() request,
    @Param('id') id: string,
    @Body() createCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.featuresService.createFeatureComment(
        request.user.sub,
        request.user.org,
        id,
        createCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id/comments')
  @Public()
  async listComments(@Param('id') id: string) {
    try {
      return await this.featuresService.listFeatureComments(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id/comments/:commentId')
  async deleteComment(
    @Request() request,
    @Param('id') featureId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      await this.featuresService.deleteFeatureComment(
        request.user.sub,
        featureId,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':id/comments/:commentId')
  async updateComment(
    @Request() request,
    @Param('id') featureId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.featuresService.updateFeatureComment(
        request.user.sub,
        featureId,
        commentId,
        updateCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
