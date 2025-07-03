import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateWikiPageDto, UpdateWikiPageDto } from './wiki-page.dtos';

@Controller('/orgs/:orgId/projects/:projectId/wiki')
@UseGuards(AuthGuard)
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPage(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateWikiPageDto,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }
    return await this.wikiService.createPage(projectId, body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPagesByParent(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }
    return this.wikiService.getPagesByParent(
      projectId,
      request.query.parentId,
      request.query.search,
    );
  }

  @Patch(':id')
  async updatePage(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() request,
    @Body() body: UpdateWikiPageDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }
    return this.wikiService.updatePage(id, body);
  }

  @Delete(':id')
  async deletePage(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }
    return this.wikiService.deletePage(id);
  }
}
