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
// TODO: Harden the security on this endpoint
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

  @Get('okrs-initiatives')
  async generateInitiativesForOKR(
    @Query('objective') objective: string,
    @Query('keyResult') keyResult: string,
  ) {
    try {
      return await this.aiService.generateInitiativesForOKR(
        objective,
        keyResult,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('requests-initiatives')
  async generateInitiativesForRequest(
    @Query('request') request: string,
    @Query('description') requestDescription: string,
  ) {
    try {
      return await this.aiService.generateInitiativesForRequest(
        request,
        requestDescription,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('initiatives-work-items')
  async generateWorkItemsForInitiative(
    @Query('initiative') initiative: string,
    @Query('description') description: string,
  ) {
    try {
      return await this.aiService.generateWorkItemsForInitiative(
        initiative,
        description,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('issues-work-items')
  async generateWorkItemsForIssue(
    @Query('issue') issue: string,
    @Query('description') description: string,
  ) {
    try {
      return await this.aiService.generateWorkItemsForIssue(issue, description);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('work-item-description')
  async getWorkItemDescription(
    @Query('workItem') workItem: string,
    @Query('workItemType') workItemType: string,
    @Query('initiativeId') initiativeId: string,
    @Query('issueId') issueId: string,
  ) {
    try {
      return await this.aiService.generateWorkItemDescription(
        workItem,
        workItemType,
        initiativeId,
        issueId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('initiative-description')
  async getInitiativeDescription(
    @Query('initiative') initiative: string,
    @Query('keyResultId') keyResultId: string,
    @Query('milestoneId') milestoneId: string,
    @Query('requestId') requestId: string,
  ) {
    try {
      return await this.aiService.generateInitiativeDescription(
        initiative,
        keyResultId,
        milestoneId,
        requestId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('demo-project-items')
  async generateDemoProjectItems(@Query('description') description: string) {
    try {
      return await this.aiService.generateDemoProjectItems(description);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
