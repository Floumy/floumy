import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { DemoService } from './demo.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateDemoDto } from './dtos';

@Controller('/orgs/:orgId/projects/:projectId/demo')
@UseGuards(AuthGuard)
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
    @Body() demoDto: CreateDemoDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    return await this.demoService.create(
      request.user.sub,
      orgId,
      projectId,
      demoDto,
    );
  }

  @Post('complete')
  @HttpCode(HttpStatus.CREATED)
  async complete(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Request() request,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    await this.demoService.complete(orgId);
  }
}
