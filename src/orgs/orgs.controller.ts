import {
  BadRequestException,
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
import { OrgPatchDto } from './dtos';

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
  async patchOrg(@Request() request, @Body() orgPatchDto: OrgPatchDto) {
    try {
      const org = request.user.org;
      return await this.orgsService.patchOrg(org, orgPatchDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
