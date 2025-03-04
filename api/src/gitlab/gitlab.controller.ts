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
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('gitlab')
export class GitlabController {
  constructor(
    private readonly gitlabService: GitlabService,
    private readonly configService: ConfigService,
  ) {}

  @Put('/auth/orgs/:orgId/token')
  async setToken(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Body('token') token: string,
  ) {
    const org = request.user.org;
    if (orgId !== org) {
      throw new UnauthorizedException();
    }

    try {
      await this.gitlabService.setToken(orgId, token);
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

  @Get('/projects/orgs/:orgId/')
  async getProject(@Request() request: any, @Param('orgId') orgId: string) {
    const org = request.user.org;
    if (orgId !== org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.gitlabService.getProjects(orgId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  // TODO: Fix the 404 error
  @Public()
  @Post('/orgs/:orgId/projects/:projectId/webhooks')
  async handleWebhook(
    @Body() payload: MergeRequestEvent | PushEvent,
    @Headers('x-gitlab-event') eventType: string,
    @Headers('x-gitlab-token') token: string,
  ) {
    if (token !== this.configService.get('gitlab.webhookSecret')) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    try {
      return await this.gitlabService.handleWebhook(payload, eventType);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
