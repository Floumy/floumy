import { Module } from '@nestjs/common';
import { WorkItemsTool } from './tools/work-items.tool';
import { McpModule } from '@rekog/mcp-nest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Project } from '../projects/project.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Cycle } from '../cycles/cycle.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Objective } from '../okrs/objective.entity';
import { Request } from '../requests/request.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { Issue } from '../issues/issue.entity';
import { User } from '../users/user.entity';
import { McpService } from './services/mcp.service';
import { ProjectTool } from './tools/project.tool';
import { BacklogModule } from '../backlog/backlog.module';
import { InitiativeTool } from './tools/initiative.tool';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { CycleTool } from './tools/cycle.tool';
import { CyclesModule } from '../cycles/cycles.module';
import { OkrTool } from './tools/okr.tool';
import { OkrsModule } from '../okrs/okrs.module';
import { RoadmapTool } from './tools/roadmap.tool';

@Module({
  imports: [
    BacklogModule,
    RoadmapModule,
    CyclesModule,
    OkrsModule,
    TypeOrmModule.forFeature([
      User,
      Org,
      Project,
      WorkItem,
      Initiative,
      Cycle,
      Issue,
      KeyResult,
      Objective,
      Request,
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
    CycleTool,
    OkrTool,
    RoadmapTool,
    McpService,
  ],
})
export class FloumyMcpModule {}
