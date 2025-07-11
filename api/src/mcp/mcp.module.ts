import { Module } from "@nestjs/common";
import { GreetingTool } from "./tools/greeting.tool";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";
import { Org } from "src/orgs/org.entity";
import { Project } from "src/projects/project.entity";
import { WorkItem } from "src/backlog/work-items/work-item.entity";
import { Initiative } from "src/roadmap/initiatives/initiative.entity";
import { Sprint } from "src/sprints/sprint.entity";
import { Issue } from "src/issues/issue.entity";
import { FeatureRequest } from "src/feature-requests/feature-request.entity";
import { KeyResult } from "src/okrs/key-result.entity";
import { Objective } from "src/okrs/objective.entity";
import { Milestone } from "src/roadmap/milestones/milestone.entity";
import { McpModule } from "@rekog/mcp-nest";
import { WorkItemsTool } from "./tools/work-items.tool";

@Module({
    providers: [GreetingTool, WorkItemsTool],
    imports: [
        McpModule.forRoot({
            name: 'floumy-mcp-server',
            version: '1.0.0',
            sseEndpoint: '/mcp/:orgId/:userId/sse',
            messagesEndpoint: '/mcp/:orgId/:userId/messages',
        }),
        TypeOrmModule.forFeature([
            User,
            Org,
            Project,
            WorkItem,
            Initiative,
            Sprint,
            Issue,
            KeyResult,
            Objective,
            FeatureRequest,
            Milestone,
        ]),
    ],
})
export class FloumyMcpModule { }
