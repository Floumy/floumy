import { Module } from "@nestjs/common";
import { WorkItemsController } from "./work-items/work-items.controller";
import { WorkItemsService } from "./work-items/work-items.service";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Feature } from "../roadmap/features/feature.entity";
import { Org } from "../orgs/org.entity";
import { KeyResult } from "../okrs/key-result.entity";
import { Objective } from "../okrs/objective.entity";
import { Milestone } from "../roadmap/milestones/milestone.entity";
import { OrgsModule } from "../orgs/orgs.module";
import { OkrsModule } from "../okrs/okrs.module";
import { WorkItem } from "./work-items/work-item.entity";
import { Iteration } from "../iterations/Iteration.entity";
import { File } from "../files/file.entity";
import { WorkItemFile } from "./work-items/work-item-file.entity";
import { User } from "../users/user.entity";
import { WorkItemsStatusLog } from "./work-items/work-items-status-log.entity";
import { WorkItemsStatusStats } from "./work-items/work-items-status-stats.entity";
import { WorkItemsEventHandler } from "./work-items/work-items.event-handler";

@Module({
  controllers: [WorkItemsController],
  providers: [WorkItemsService, WorkItemsEventHandler],
  imports: [TypeOrmModule.forFeature([Feature, Org, KeyResult, Objective, Milestone, WorkItem, Iteration, File, WorkItemFile, User, WorkItemsStatusLog, WorkItemsStatusStats]), OrgsModule, OkrsModule, AuthModule],
  exports: [WorkItemsService]
})
export class BacklogModule {
}
