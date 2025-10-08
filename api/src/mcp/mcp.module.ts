import { Module } from '@nestjs/common';
import { WorkItemsTool } from './tools/work-items.tool';
import { McpModule } from '@rekog/mcp-nest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Project } from '../projects/project.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Sprint } from '../sprints/sprint.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Objective } from '../okrs/objective.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { Issue } from '../issues/issue.entity';
import { User } from '../users/user.entity';
import { McpService } from './services/mcp.service';
import { ProjectTool } from './tools/project.tool';
import { BacklogModule } from '../backlog/backlog.module';
import { InitiativeTool } from './tools/initiative.tool';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { SprintTool } from './tools/sprint.tool';
import { SprintsModule } from '../sprints/sprints.module';
import { OkrTool } from './tools/okr.tool';
import { OkrsModule } from '../okrs/okrs.module';
import { RoadmapTool } from './tools/roadmap.tool';

@Module({
  imports: [
    BacklogModule,
    RoadmapModule,
    SprintsModule,
    OkrsModule,
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
    McpModule.forRoot({
      name: 'floumy-mcp-server',
      version: '1.0.0',
    }),
  ],
  providers: [
    ProjectTool,
    WorkItemsTool,
    InitiativeTool,
    SprintTool,
    OkrTool,
    RoadmapTool,
    McpService,
  ],
})
export class FloumyMcpModule {}
