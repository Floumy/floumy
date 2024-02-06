import { Module } from "@nestjs/common";
import { OrgsService } from "./orgs.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { Org } from "./org.entity";
import { OrgsController } from "./orgs.controller";
import { TokensService } from "../auth/tokens.service";

@Module({
  imports: [TypeOrmModule.forFeature([Org]), ConfigModule],
  providers: [OrgsService, TokensService],
  exports: [OrgsService],
  controllers: [OrgsController]
})
export class OrgsModule {
}
