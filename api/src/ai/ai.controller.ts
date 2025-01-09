import {
  BadRequestException,
  Controller,
  Get,
  Query,
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

  @Get('key-results')
  async generateKeyResults(@Query('objective') objective: string) {
    try {
      return await this.aiService.generateKeyResults(objective);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
