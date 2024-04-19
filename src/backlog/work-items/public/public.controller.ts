import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../../auth/public.guard';

@Controller('orgs/:orgId/work-items')
@Public()
export class PublicController {
  constructor(private workItemsPublicService: PublicService) {}

  @Get('/:workItemId')
  async getWorkItem(
    @Param('orgId') orgId: string,
    @Param('workItemId') workItemId: string,
  ) {
    try {
      return await this.workItemsPublicService.getWorkItem(orgId, workItemId);
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
