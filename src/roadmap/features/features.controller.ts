import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards
} from "@nestjs/common";
import { FeaturesService } from "./features.service";
import { CreateUpdateFeatureDto } from "./dtos";
import { AuthGuard } from "../../auth/auth.guard";

@Controller("features")
@UseGuards(AuthGuard)
export class FeaturesController {

  constructor(private featuresService: FeaturesService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() featureDto: CreateUpdateFeatureDto) {
    const { org: orgId } = request.user;
    try {
      return await this.featuresService.createFeature(orgId, featureDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Request() request) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.listFeatures(orgId);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get("/without-milestone")
  @HttpCode(HttpStatus.OK)
  async listWithoutMilestone(@Request() request) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.listFeaturesWithoutMilestone(orgId);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async get(@Request() request, @Param("id") id: string) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.getFeature(orgId, id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async update(@Request() request, id: string, @Body() updateFeatureDto: CreateUpdateFeatureDto) {
    try {
      const { org: orgId } = request.user;
      return await this.featuresService.updateFeature(orgId, id, updateFeatureDto);
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
