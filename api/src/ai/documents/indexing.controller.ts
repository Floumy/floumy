import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { IndexingService } from './indexing.service';

@Controller('indexing')
@UseGuards(AuthGuard)
export class IndexingController {
  constructor(private readonly indexingService: IndexingService) {}

  @Get('start/:orgId')
  async startIndexing(@Param('orgId') orgId: string) {
    const taskId = await this.indexingService.startIndexing(orgId);
    return { taskId };
  }

  @Get('cancel/:taskId')
  async cancelIndexing(@Param('taskId') taskId: string) {
    const result = await this.indexingService.cancelIndexing(taskId);
    return { success: result };
  }
}
