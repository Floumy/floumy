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
  Patch,
  Post,
  Put,
  Request,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "../../auth/auth.guard";
import { WorkItemsService } from "./work-items.service";
import { CreateUpdateWorkItemDto, WorkItemDto, WorkItemPatchDto } from "./dtos";

@Controller("work-items")
@UseGuards(AuthGuard)
export class WorkItemsController {

  constructor(private workItemsService: WorkItemsService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() workItemDto: CreateUpdateWorkItemDto): Promise<WorkItemDto> {
    try {
      return await this.workItemsService.createWorkItem(request.user.sub, workItemDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    return await this.workItemsService.listWorkItems(request.user.org);
  }

  @Get("open")
  @HttpCode(HttpStatus.OK)
  async listOpenWithoutIterations(@Request() request) {
    return await this.workItemsService.listOpenWorkItemsWithoutIterations(request.user.org);
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

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async update(@Request() request, @Param("id") id: string, @Body() workItemDto: CreateUpdateWorkItemDto) {
    try {
      return await this.workItemsService.updateWorkItem(request.user.org, id, workItemDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Request() request, @Param("id") id: string) {
    try {
      await this.workItemsService.deleteWorkItem(request.user.org, id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  async patch(@Request() request, @Param("id") id: string, @Body() workItemDto: WorkItemPatchDto) {
    try {
      return await this.workItemsService.patchWorkItem(request.user.org, id, workItemDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
