import { Module } from "@nestjs/common";
import { OkrsService } from "./okrs.service";
import { OkrsController } from "./okrs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OrgsModule } from "../orgs/orgs.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Objective]), OrgsModule, AuthModule],
  providers: [OkrsService],
  controllers: [OkrsController]
})
export class OkrsModule {
}
