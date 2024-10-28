import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { FeatureRequestVoteService } from './feature-request-votes.service';
import { CreateUpdateCommentDto } from '../comments/dtos';

@Controller('orgs/:orgId/products/:productId/feature-requests')
export class FeatureRequestsController {
  constructor(
    private featureRequestsService: FeatureRequestsService,
    private featureRequestVoteService: FeatureRequestVoteService,
  ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      return await this.featureRequestsService.searchFeatureRequestsByTitleOrDescription(
        orgId,
        productId,
        query,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('my-votes')
  @UseGuards(AuthGuard)
  async getMyVotes(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
  ) {
    try {
      return await this.featureRequestVoteService.getVotes(
        request.user.sub,
        orgId,
        productId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async addFeatureRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Body() createFeatureRequestDto: CreateFeatureRequestDto,
  ) {
    try {
      return await this.featureRequestsService.addFeatureRequest(
        request.user.sub,
        orgId,
        productId,
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
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 0,
  ) {
    try {
      return await this.featureRequestsService.listFeatureRequests(
        orgId,
        productId,
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
    @Param('productId') productId: string,
    @Param('featureRequestId') featureRequestId: string,
  ) {
    try {
      return await this.featureRequestsService.getFeatureRequestById(
        orgId,
        productId,
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
    @Param('productId') productId: string,
    @Param('featureRequestId') featureRequestId: string,
    @Body() updateFeatureRequestDto: UpdateFeatureRequestDto,
  ) {
    try {
      return await this.featureRequestsService.updateFeatureRequest(
        request.user.sub,
        orgId,
        productId,
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
    @Param('productId') productId: string,
    @Param('featureRequestId') featureRequestId: string,
  ) {
    try {
      return await this.featureRequestsService.deleteFeatureRequest(
        request.user.sub,
        orgId,
        productId,
        featureRequestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':featureRequestId/upvote')
  @UseGuards(AuthGuard)
  async upvoteFeatureRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('featureRequestId') featureRequestId: string,
  ) {
    try {
      return await this.featureRequestVoteService.upvoteFeatureRequest(
        request.user.sub,
        orgId,
        productId,
        featureRequestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':featureRequestId/downvote')
  @UseGuards(AuthGuard)
  async downvoteFeatureRequest(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('featureRequestId') featureRequestId: string,
  ) {
    try {
      return await this.featureRequestVoteService.downvoteFeatureRequest(
        request.user.sub,
        orgId,
        productId,
        featureRequestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':featureRequestId/comments')
  @UseGuards(AuthGuard)
  async addFeatureRequestComment(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('featureRequestId') featureRequestId: string,
    @Body() createCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.featureRequestsService.createFeatureRequestComment(
        orgId,
        productId,
        request.user.sub,
        featureRequestId,
        createCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put(':featureRequestId/comments/:commentId')
  @UseGuards(AuthGuard)
  async updateFeatureRequestComment(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
    @Param('featureRequestId') featureRequestId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CreateUpdateCommentDto,
  ) {
    try {
      return await this.featureRequestsService.updateFeatureRequestComment(
        orgId,
        productId,
        request.user.sub,
        featureRequestId,
        commentId,
        updateCommentDto,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':featureRequestId/comments/:commentId')
  @UseGuards(AuthGuard)
  async deleteFeatureRequestComment(
    @Param('orgId') orgId: string,
    @Request() request,
    @Param('featureRequestId') featureRequestId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      return await this.featureRequestsService.deleteFeatureRequestComment(
        orgId,
        request.user.sub,
        featureRequestId,
        commentId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
