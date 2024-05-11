import { Controller, Get, HttpCode, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OrgsService } from './orgs.service';

@Controller('orgs')
@UseGuards(AuthGuard)
export class OrgsController {
  constructor(private orgsService: OrgsService) {}

  @Get('current')
  @HttpCode(200)
  async getOrg(@Request() request) {
    const org = request.user.org;
    return await this.orgsService.getOrg(org);
  }
}
