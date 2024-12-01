import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

@Controller('orgs')
export class OrgsController {
  constructor(private orgsService: OrgsService) {}

  @Get('current')
  @HttpCode(200)
  @UseGuards(BasicAuthGuard)
  async getOrg(@Request() request) {
    const org = request.user.org;
    return await this.orgsService.getOrg(org);
  }

  @Patch('current')
  @HttpCode(200)
  @UseGuards(BasicAuthGuard)
  async patchOrg(@Request() request, @Body() requestBody: { name: string }) {
    const org = request.user.org;
    return await this.orgsService.patchOrg(org, requestBody.name);
  }

  @Get(':id/users')
  @HttpCode(200)
  @UseGuards(BasicAuthGuard)
  async getUsers(@Request() request) {
    const org = request.user.org;
    return await this.orgsService.getUsers(org);
  }
}
