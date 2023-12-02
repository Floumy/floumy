import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from "@nestjs/common";
import { FeaturesService } from "./features.service";
import { CreateFeatureDto } from "./dtos";
import { AuthGuard } from "../../auth/auth.guard";

@Controller("features")
@UseGuards(AuthGuard)
export class FeaturesController {

  constructor(private featuresService: FeaturesService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() featureDto: CreateFeatureDto) {
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
}
