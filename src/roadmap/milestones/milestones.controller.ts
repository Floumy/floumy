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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { CreateUpdateMilestoneDto } from './dtos';
import { AuthGuard } from '../../auth/auth.guard';
import { Timeline } from '../../common/timeline.enum';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('milestones')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class MilestonesController {
  constructor(private milestonesService: MilestonesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() request,
    @Body() createMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.createMilestone(
        orgId,
        createMilestoneDto,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listMilestonesWithFeatures(@Request() request) {
    const { org: orgId } = request.user;
    return await this.milestonesService.listMilestonesWithFeatures(orgId);
  }

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    const { org: orgId } = request.user;
    return await this.milestonesService.listMilestones(orgId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Request() request, @Param('id') id) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.get(orgId, id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() request,
    @Param('id') id: string,
    @Body() updateMilestoneDto: CreateUpdateMilestoneDto,
  ) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.update(orgId, id, updateMilestoneDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Request() request, @Param('id') id: string) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.delete(orgId, id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('timeline/:timeline')
  async listForTimeline(
    @Request() request,
    @Param('timeline') timeline: Timeline,
  ) {
    return await this.milestonesService.listForTimeline(
      request.user.org,
      timeline,
    );
  }
}
