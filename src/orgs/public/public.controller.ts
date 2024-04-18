import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('org')
export class PublicController {
  constructor(private publicOrgsService: PublicService) {}

  @Get(':id')
  async getOrg(@Param('id') id: string) {
    try {
      return await this.publicOrgsService.getPublicOrg(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
