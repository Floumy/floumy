import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { IndexingService } from './indexing.service';

@Controller('indexing')
@UseGuards(AuthGuard)
export class IndexingController {
  constructor(private readonly indexingService: IndexingService) {}

  @Get()
  async indexEntities(@Request() request: any) {
    return await this.indexingService.indexEntities(request.user.org);
  }
}
