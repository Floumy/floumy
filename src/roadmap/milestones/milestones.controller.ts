import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { MilestonesService } from "./milestones.service";
import { CreateMilestoneDto } from "./dtos";
import { AuthGuard } from "../../auth/auth.guard";

@Controller("milestones")
@UseGuards(AuthGuard)
export class MilestonesController {

  constructor(private milestonesService: MilestonesService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() createMilestoneDto: CreateMilestoneDto) {
    const { org: orgId } = request.user;
    try {
      return await this.milestonesService.createMilestone(orgId, createMilestoneDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
