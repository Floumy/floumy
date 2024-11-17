import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('feed')
@UseGuards(AuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async listFeedItems(
    @Request() request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return await this.feedService.listFeedItems(
        request.user.org,
        page,
        limit,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFeedItem(
    @Request() request,
    @Body() textFeedItem: { text: string },
  ) {
    try {
      return await this.feedService.createTextFeedItem(
        request.user.sub,
        request.user.org,
        textFeedItem,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
