import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';

@Controller('/build-in-public/org/:orgId')
@Public()
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('settings')
  async getPublicSettings(@Param('orgId') orgId: string) {
    try {
      return await this.publicService.getPublicSettings(orgId);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
