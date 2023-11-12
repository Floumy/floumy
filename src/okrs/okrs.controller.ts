import {
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
  UseGuards
} from "@nestjs/common";
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
    return await this.okrsService.list(orgId);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async get(@Param("id") id: string, @Request() request) {
    const { org: orgId } = request.user;
    try {
      return await this.okrsService.get(orgId, id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async update(@Param("id") id: string, @Request() request, @Body() okrDto: OKRDto) {
    const { org: orgId } = request.user;
    return await this.okrsService.update(orgId, id, okrDto.objective.objective, okrDto.objective.description);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Param("id") id: string, @Request() request) {
    const { org: orgId } = request.user;
    return await this.okrsService.delete(orgId, id);
  }
}
