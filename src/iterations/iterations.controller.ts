import { BadRequestException, Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CreateOrUpdateIterationDto } from "./dtos";
import { IterationsService } from "./iterations.service";

@Controller("iterations")
@UseGuards(AuthGuard)
export class IterationsController {

  constructor(private iterationsService: IterationsService) {
  }

  @Post()
  async create(@Request() request, @Body() body: CreateOrUpdateIterationDto) {
    try {
      return await this.iterationsService.create(request.user.orgId, body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
