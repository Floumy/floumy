import { Module } from "@nestjs/common";
import { OrgsService } from "./orgs.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { Org } from "./org.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Org]), ConfigModule],
  providers: [OrgsService],
  exports: [OrgsService]
})
export class OrgsModule {
}
