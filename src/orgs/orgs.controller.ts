import {
  Controller,
  Get,
  HttpCode,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OrgsService } from './orgs.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('orgs')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class OrgsController {
  constructor(private orgsService: OrgsService) {}

  @Get('current')
  @HttpCode(200)
  async getOrg(@Request() request) {
    const org = request.user.org;
    return await this.orgsService.getOrg(org);
  }
}
