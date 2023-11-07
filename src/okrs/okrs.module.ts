import { Module } from "@nestjs/common";
import { OkrsService } from "./okrs.service";
import { OkrsController } from "./okrs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Objective])],
  providers: [OkrsService],
  controllers: [OkrsController]
})
export class OkrsModule {
}
