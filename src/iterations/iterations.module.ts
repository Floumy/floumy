import { Module } from "@nestjs/common";
import { IterationsController } from "./iterations.controller";
import { IterationsService } from "./iterations.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Org } from "../orgs/org.entity";
import { WorkItem } from "../backlog/work-items/work-item.entity";
import { OrgsModule } from "../orgs/orgs.module";
import { AuthModule } from "../auth/auth.module";
import { Iteration } from "./Iteration.entity";
import { User } from "../users/user.entity";

@Module({
  controllers: [IterationsController],
  imports: [TypeOrmModule.forFeature([Org, WorkItem, Iteration, User]), OrgsModule, AuthModule],
  providers: [IterationsService]
})
export class IterationsModule {
}
