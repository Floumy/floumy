import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../auth/public.guard';

@Controller('/build-in-public/org/:orgId')
@Public()
export class PublicController {
  constructor(private publicBipService: PublicService) {}

  @Get('settings')
  async getPublicSettings(@Param('orgId') orgId: string) {
    try {
      return await this.publicBipService.getPublicSettings(orgId);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
