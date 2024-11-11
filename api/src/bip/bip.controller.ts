import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BipSettingsDto } from './bip.dtos';
import { AuthGuard } from '../auth/auth.guard';
import { BipService } from './bip.service';

@Controller('build-in-public')
@UseGuards(AuthGuard)
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

  @Get('settings')
  @HttpCode(200)
  async getSettings(@Request() request) {
    try {
      return await this.bipService.getSettings(request.user.org);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
