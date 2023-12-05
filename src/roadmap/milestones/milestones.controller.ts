import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards
} from "@nestjs/common";
import { MilestonesService } from "./milestones.service";
import { CreateUpdateMilestoneDto } from "./dtos";
import { AuthGuard } from "../../auth/auth.guard";

@Controller("milestones")
@UseGuards(AuthGuard)
export class MilestonesController {

  constructor(private milestonesService: MilestonesService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() createMilestoneDto: CreateUpdateMilestoneDto) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.createMilestone(orgId, createMilestoneDto);
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

  @Get("/list")
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    const { org: orgId } = request.user;
    return await this.milestonesService.listMilestones(orgId);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async get(@Request() request, @Param("id") id) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.get(orgId, id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async update(@Request() request, @Param("id") id, @Body() updateMilestoneDto: CreateUpdateMilestoneDto) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.update(orgId, id, updateMilestoneDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
