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
import { Public } from '../auth/public.guard';

@Controller('/orgs/:orgId/projects/:projectId/build-in-public')
export class BipController {
  constructor(private bipService: BipService) {}

  @Put('settings')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async createOrUpdateSettings(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Body() settings: BipSettingsDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.bipService.createOrUpdateSettings(
        orgId,
        projectId,
        settings,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('settings')
  @HttpCode(200)
  @Public()
  async getSettings(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.bipService.getSettings(orgId, projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
