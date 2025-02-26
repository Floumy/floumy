import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GitlabService } from './gitlab.service';

@Controller('gitlab')
export class GitlabController {
  constructor(private readonly gitlabService: GitlabService) {}

  @Post('/auth/orgs/:orgId/token')
  async setToken(@Param('orgId') orgId: string, @Body('token') token: string) {
    await this.gitlabService.setToken(orgId, token);
  }

  @Post('/projects/orgs/:orgId/projects/:projectId/')
  async addProject(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body('project') project: any,
  ) {
    return await this.gitlabService.addProject(orgId, projectId, project);
  }

  @Get('/projects/orgs/:orgId/')
  async getProject(@Param('orgId') orgId: string) {
    return await this.gitlabService.getProjects(orgId);
  }
}
