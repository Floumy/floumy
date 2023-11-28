import { Module } from "@nestjs/common";
import { OkrsService } from "./okrs.service";
import { OkrsController } from "./okrs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OrgsModule } from "../orgs/orgs.module";
import { AuthModule } from "../auth/auth.module";
import { KeyResult } from "./key-result.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Objective, KeyResult]), OrgsModule, AuthModule],
  providers: [OkrsService],
  controllers: [OkrsController],
  exports: [OkrsService]
})
export class OkrsModule {
}
