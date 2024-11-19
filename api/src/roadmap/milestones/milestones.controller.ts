import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { CreateUpdateMilestoneDto } from './dtos';
import { AuthGuard } from '../../auth/auth.guard';
import { Timeline } from '../../common/timeline.enum';

@Controller('/orgs/:orgId/products/:productId/milestones')
@UseGuards(AuthGuard)
export class MilestonesController {
  constructor(private milestonesService: MilestonesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
    @Body() createMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.milestonesService.createMilestone(
        orgId,
        productId,
        createMilestoneDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listMilestonesWithFeatures(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.milestonesService.listMilestonesWithFeatures(
      orgId,
      productId,
    );
  }

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.milestonesService.listMilestones(orgId, productId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
    @Param('id') id,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.milestonesService.get(orgId, productId, id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
    @Param('id') id: string,
    @Body() updateMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.milestonesService.update(
        orgId,
        productId,
        id,
        updateMilestoneDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
    @Param('id') id: string,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.milestonesService.delete(orgId, productId, id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('timeline/:timeline')
  async listForTimeline(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Request() request,
    @Param('timeline') timeline: Timeline,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    return await this.milestonesService.listForTimeline(
      orgId,
      productId,
      timeline,
    );
  }
}
