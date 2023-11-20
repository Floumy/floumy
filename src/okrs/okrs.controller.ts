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
import { OkrsService } from "./okrs.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("okrs")
@UseGuards(AuthGuard)
export class OkrsController {

  constructor(private okrsService: OkrsService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() okrDto: CreateOrUpdateOKRDto) {
    const { org: orgId } = request.user;
    try {
      return await this.okrsService.create(orgId, okrDto);
    } catch (e) {
      throw new BadRequestException();
    }
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
  async update(@Param("id") id: string, @Request() request, @Body() okrDto: CreateOrUpdateOKRDto) {
    const { org: orgId } = request.user;
    await this.okrsService.update(orgId, id, okrDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Param("id") id: string, @Request() request) {
    const { org: orgId } = request.user;
    await this.okrsService.delete(orgId, id);
  }

  @Patch(":objectiveId/key-results/:keyResultId")
  @HttpCode(HttpStatus.OK)
  async patchKeyResult(
    @Param("objectiveId") objectiveId: string,
    @Param("keyResultId") keyResultId: string,
    @Request() request,
    @Body() updateKeyResultDto: PatchKeyResultDto
  ) {
    const { org: orgId } = request.user;
    try {
      return await this.okrsService.patchKeyResult(
        orgId,
        objectiveId,
        keyResultId,
        updateKeyResultDto
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Patch(":objectiveId")
  @HttpCode(HttpStatus.OK)
  async patchObjective(
    @Param("objectiveId") objectiveId: string,
    @Request() request,
    @Body() updateObjectiveDto: PatchObjectiveDto
  ) {
    const { org: orgId } = request.user;
    return await this.okrsService.patchObjective(
      orgId,
      objectiveId,
      updateObjectiveDto
    );
  }
}
