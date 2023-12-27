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
      return await this.iterationsService.create(request.user.org, body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  async list(@Request() request) {
    return await this.iterationsService.list(request.user.org);
  }

  @Post(":id/start")
  @HttpCode(200)
  async startIteration(@Request() request, @Param("id") id: string) {
    try {
      return await this.iterationsService.startIteration(request.user.org, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get("active")
  @HttpCode(200)
  async getActiveIteration(@Request() request) {
    return await this.iterationsService.getActiveIteration(request.user.org);
  }

  @Post(":id/complete")
  @HttpCode(200)
  async completeIteration(@Request() request, @Param("id") id: string) {
    try {
      return await this.iterationsService.completeIteration(request.user.org, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get(":id")
  @HttpCode(200)
  async get(@Request() request, @Param("id") id: string) {
    try {
      return await this.iterationsService.get(request.user.org, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(":id")
  @HttpCode(200)
  async update(@Request() request, @Param("id") id: string, @Body() body: CreateOrUpdateIterationDto) {
    try {
      return await this.iterationsService.update(request.user.org, id, body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(":id")
  @HttpCode(200)
  async delete(@Request() request, @Param("id") id: string) {
    try {
      return await this.iterationsService.delete(request.user.org, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
