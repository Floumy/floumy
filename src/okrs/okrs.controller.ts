import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { OkrsService } from "./okrs.service";
import { AuthGuard } from "../auth/auth.guard";

interface ObjectiveDto {
  objective: string;
  description: string;
}

interface OKRDto {
  objective: ObjectiveDto;
}

@Controller("okrs")
@UseGuards(AuthGuard)
export class OkrsController {

  constructor(private okrsService: OkrsService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() okrDto: OKRDto) {
    const { org: orgId } = request.user;
    const objective = await this.okrsService.createObjective(
      orgId,
      okrDto.objective.objective,
      okrDto.objective.description
    );
    return { objective };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    const { org: orgId } = request.user;
    return this.okrsService.list(orgId);
  }
}
