import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { Public } from '../auth/public.guard';
import { MergeRequestEvent, PushEvent } from './dtos';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('gitlab')
export class GitlabController {
  constructor(private readonly gitlabService: GitlabService) {}

  @Get('auth/orgs/:orgId/projects/:projectId/is-connected')
  async isConnected(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.gitlabService.isConnected(orgId, projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('/auth/orgs/:orgId/projects/:projectId/token')
  async setToken(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body('token') token: string,
  ) {
    const org = request.user.org;
    if (orgId !== org) {
      throw new UnauthorizedException();
    }

    try {
      await this.gitlabService.setToken(projectId, token);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('/projects/orgs/:orgId/projects/:projectId/')
  async setProject(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body('project') gitlabProjectId: string,
  ) {
    const org = request.user.org;
    if (orgId !== org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.gitlabService.setProject(
        orgId,
        projectId,
        gitlabProjectId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('/projects/orgs/:orgId/projects/:projectId/')
  async listProjects(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    const org = request.user.org;
    if (orgId !== org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.gitlabService.getProjects(projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('/merge-requests/orgs/:orgId/projects/:projectId/')
  async listMergeRequests(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.gitlabService.listMergeRequests(orgId, projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Public()
  @Post('/orgs/:orgId/projects/:projectId/webhooks')
  async handleWebhook(
    @Body() payload: MergeRequestEvent | PushEvent,
    @Headers('x-gitlab-event') eventType: string,
    @Headers('x-gitlab-token') token: string,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.gitlabService.handleWebhook(
        orgId,
        projectId,
        token,
        payload,
        eventType,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
