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
  Request,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "../../auth/auth.guard";
import { WorkItemsService } from "./work-items.service";
import { CreateUpdateWorkItemDto, WorkItemDto } from "./dtos";

@Controller("work-items")
@UseGuards(AuthGuard)
export class WorkItemsController {

  constructor(private workItemsService: WorkItemsService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() workItemDto: CreateUpdateWorkItemDto): Promise<WorkItemDto> {
    try {
      return await this.workItemsService.createWorkItem(request.user.org, workItemDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    return await this.workItemsService.listWorkItems(request.user.org);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async get(@Request() request, @Param("id") id: string) {
    try {
      return await this.workItemsService.getWorkItem(request.user.org, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
