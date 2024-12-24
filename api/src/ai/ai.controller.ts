import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('key-results')
  async generateKeyResults(@Query('objective') objective: string) {
    return await this.aiService.generateKeyResults(objective);
  }

  @Get('initiatives')
  async generateInitiatives(
    @Query('objective') objective: string,
    @Query('keyResults') keyResults: string[],
  ) {
    return await this.aiService.generateInitiatives(objective, keyResults);
  }

  @Get('work-items')
  async generateWorkItems(@Query('initiative') initiative: string) {
    return await this.aiService.generateWorkItems(initiative);
  }
}
