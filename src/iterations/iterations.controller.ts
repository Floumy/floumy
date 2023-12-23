import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CreateOrUpdateIterationDto } from "./dtos";
import { IterationsService } from "./iterations.service";

@Controller("iterations")
@UseGuards(AuthGuard)
export class IterationsController {

  constructor(private iterationsService: IterationsService) {
  }

  @Post()
  @HttpCode(201)
  async create(@Request() request, @Body() body: CreateOrUpdateIterationDto) {
    try {
      return await this.iterationsService.create(request.user.orgId, body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  async list(@Request() request) {
    return await this.iterationsService.list(request.user.orgId);
  }

  @Get(":id")
  @HttpCode(200)
  async get(@Request() request, @Param("id") id: string) {
    try {
      return await this.iterationsService.get(request.user.orgId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(":id")
  @HttpCode(200)
  async update(@Request() request, @Param("id") id: string, @Body() body: CreateOrUpdateIterationDto) {
    try {
      return await this.iterationsService.update(request.user.orgId, id, body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(":id")
  @HttpCode(200)
  async delete(@Request() request, @Param("id") id: string) {
    try {
      return await this.iterationsService.delete(request.user.orgId, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
