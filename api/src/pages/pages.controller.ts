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
import { PagesService } from './pages.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePageDto, UpdatePageDto } from './pages.dtos';

@Controller('/orgs/:orgId/projects/:projectId/pages')
@UseGuards(AuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPage(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreatePageDto,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }
    return await this.pagesService.createPage(orgId, projectId, body);
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
    return this.pagesService.getPagesByParent(
      orgId,
      projectId,
      request.query.parentId,
      request.query.search,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPage(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    return this.pagesService.getPage(orgId, projectId, id);
  }

  @Patch(':id')
  async updatePage(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() request,
    @Body() body: UpdatePageDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }
    return this.pagesService.updatePage(orgId, projectId, id, body);
  }

  @Delete(':id')
  async deletePage(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }
    return this.pagesService.deletePage(orgId, projectId, id);
  }
}
