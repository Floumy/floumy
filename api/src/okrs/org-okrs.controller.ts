import {
  BadRequestException,
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
import { OkrsService } from './okrs.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateOrUpdateOKRDto } from './dtos';

@Controller('/orgs/:orgId/')
@UseGuards(AuthGuard)
export class OrgOkrsController {
  constructor(private readonly okrsService: OkrsService) {}

  @Post('okrs')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('orgId') orgId: string,
    @Request() request,
    @Body() okrDto: CreateOrUpdateOKRDto,
  ) {
    const { org: userOrgId } = request.user;

    if (orgId !== userOrgId) {
      throw new UnauthorizedException();
    }

    try {
      return await this.okrsService.createOrgOkr(orgId, okrDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
