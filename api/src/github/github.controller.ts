import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  Headers,
  Delete,
} from '@nestjs/common';
import { GithubService } from './github.service';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/public.guard';
import { ConfigService } from '@nestjs/config';

@Controller('github')
@UseGuards(AuthGuard)
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly configService: ConfigService,
  ) {}

  @Get('auth/orgs/:orgId/projects/:projectId')
  async getAuthUrl(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.githubService.getAuthUrl(orgId, projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('auth/callback')
  @Public()
  async handleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: any,
  ) {
    try {
      const { orgId, projectId } = await this.githubService.handleOAuthCallback(
        code,
        state,
      );
      const url = `${this.configService.get(
        'app.url',
      )}/admin/orgs/${orgId}/projects/${projectId}/code`;
      return response.redirect(url);
    } catch (e) {
      return response.redirect(this.configService.get('app.url'));
    }
  }

  @Get('auth/orgs/:orgId/repos')
  async getRepos(@Request() request: any, @Param('orgId') orgId: string) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.githubService.getRepos(orgId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

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
      return await this.githubService.isConnected(orgId, projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('auth/orgs/:orgId/projects/:projectId/github/repo')
  async updateProjectRepo(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body() updateProjectRepoDto: { id: number },
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.githubService.updateProjectRepo(
        projectId,
        orgId,
        updateProjectRepoDto.id,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/orgs/:orgId/projects/:projectId/webhooks')
  @Public()
  async handleWebhook(
    @Headers() headers: any,
    @Body() payload: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    return await this.githubService.handleWebhook(
      orgId,
      projectId,
      headers,
      payload,
    );
  }

  @Get('auth/orgs/:orgId/projects/:projectId/github/prs')
  async getOpenPullRequests(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.githubService.getPullRequests(orgId, projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete('auth/orgs/:orgId/projects/:projectId/github/repo')
  async deleteProjectGithubRepo(
    @Request() request: any,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.githubService.deleteProjectGithubRepo(orgId, projectId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
