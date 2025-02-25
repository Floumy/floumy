import { Body, Controller, Param, Post } from '@nestjs/common';
import { GitlabService } from './gitlab.service';

@Controller('gitlab')
export class GitlabController {
  constructor(private readonly gitlabService: GitlabService) {}

  @Post('/auth/orgs/:orgId/token')
  async setToken(@Param('orgId') orgId: string, @Body('token') token: string) {
    await this.gitlabService.setToken(orgId, token);
  }
}
