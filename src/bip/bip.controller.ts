import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BipSettingsDto } from './bip.dtos';
import { AuthGuard } from '../auth/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { BipService } from './bip.service';

@Controller('bip')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class BipController {
  constructor(private bipService: BipService) {}

  @Put('settings')
  @HttpCode(200)
  async createOrUpdateSettings(
    @Request() request,
    @Body() settings: BipSettingsDto,
  ) {
    try {
      return await this.bipService.createOrUpdateSettings(
        request.user.org,
        settings,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
