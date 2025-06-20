import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { BasicAuthGuard } from '../auth/basic-auth.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.guard';

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
  @UseGuards(AuthGuard)
  @Roles('admin')
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

  @Get(':id/users/:userId')
  @HttpCode(200)
  @UseGuards(BasicAuthGuard)
  async getUser(
    @Param('id') orgId: string,
    @Param('userId') userId: string,
    @Request() request,
  ) {
    const org = request.user.org;

    if (org !== orgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.orgsService.getUser(orgId, userId);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
