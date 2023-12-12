import { Module } from "@nestjs/common";
import { WorkItemsController } from "./work-items/work-items.controller";
import { WorkItemsService } from "./work-items/work-items.service";
import { AuthModule } from "../auth/auth.module";
import { RoadmapModule } from "../roadmap/roadmap.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Feature } from "../roadmap/features/feature.entity";
import { Org } from "../orgs/org.entity";
import { KeyResult } from "../okrs/key-result.entity";
import { Objective } from "../okrs/objective.entity";
import { Milestone } from "../roadmap/milestones/milestone.entity";
import { OrgsModule } from "../orgs/orgs.module";
import { OkrsModule } from "../okrs/okrs.module";
import { WorkItem } from "./work-items/work-item.entity";

@Module({
  controllers: [WorkItemsController],
  providers: [WorkItemsService],
  imports: [TypeOrmModule.forFeature([Feature, Org, KeyResult, Objective, Milestone, WorkItem]), OrgsModule, OkrsModule, AuthModule]
})
export class BacklogModule {
}
