import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BipSettingsDto } from './bip.dtos';
import { AuthGuard } from '../auth/auth.guard';
import { BipService } from './bip.service';

@Controller('/orgs/:orgId/products/:productId/build-in-public')
@UseGuards(AuthGuard)
export class BipController {
  constructor(private bipService: BipService) {}

  @Put('settings')
  @HttpCode(200)
  async createOrUpdateSettings(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
    @Body() settings: BipSettingsDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.bipService.createOrUpdateSettings(
        orgId,
        productId,
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
