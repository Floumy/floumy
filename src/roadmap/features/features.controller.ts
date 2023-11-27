import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Request } from "@nestjs/common";
import { FeaturesService } from "./features.service";
import { CreateFeatureDto } from "./dtos";

@Controller("features")
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
}
