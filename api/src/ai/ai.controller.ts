import {
  Request,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthGuard } from '../auth/auth.guard';

@Controller('/ai')
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('description-for-initiative')
  async generateDescriptionForInitiative(
    @Query('initiative') initiative: string,
  ) {
    try {
      return await this.aiService.generateDescriptionForInitiative(initiative);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Get('description-for-work-item')
  async generateDescriptionForWorkItem(@Query('workItem') workItem: string) {
    return await this.aiService.generateDescriptionForWorkItem(workItem);
  }

  @Get('key-results')
  async generateKeyResults(@Query('objective') objective: string) {
    return await this.aiService.generateKeyResults(objective);
  }

  @Post('initiatives')
  async addInitiatives(
    @Request() request,
    @Body('keyResult') keyResult: string,
  ) {
    const user = request.user.sub;
    return await this.aiService.addInitiativesForKeyResult(user, keyResult);
  }

  @Post('work-items')
  async generateWorkItems(@Query('initiative') initiative: string) {
    return await this.aiService.generateWorkItems(initiative);
  }
}
