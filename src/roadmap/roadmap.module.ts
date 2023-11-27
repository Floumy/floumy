import { Module } from "@nestjs/common";
import { FeaturesController } from "./features/features.controller";
import { FeaturesService } from "./features/features.service";

@Module({
  controllers: [FeaturesController],
  providers: [FeaturesService]
})
export class RoadmapModule {
}
