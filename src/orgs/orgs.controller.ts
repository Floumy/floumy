import { Controller, Get, HttpCode, Request, UseGuards } from '@nestjs/common';
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
}
