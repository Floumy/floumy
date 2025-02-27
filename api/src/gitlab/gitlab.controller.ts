import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { GitlabService } from './gitlab.service';

interface MergeRequestEvent {
  object_kind: 'merge_request';
  object_attributes: {
    state: string;
    action: string;
    title: string;
    description: string;
    source_branch: string;
    target_branch: string;
    url: string;
  };
  project: {
    id: number;
    name: string;
  };
}

interface PushEvent {
  ref: string; // refs/heads/branch-name
  before: string;
  after: string;
  project_id: number;
  project: {
    name: string;
  };
}

@Controller('gitlab')
export class GitlabController {
  constructor(private readonly gitlabService: GitlabService) {}

  @Put('/auth/orgs/:orgId/token')
  async setToken(@Param('orgId') orgId: string, @Body('token') token: string) {
    await this.gitlabService.setToken(orgId, token);
  }

  @Put('/projects/orgs/:orgId/projects/:projectId/')
  async setProject(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body('project') gitlabProjectId: string,
  ) {
    return await this.gitlabService.setProject(
      orgId,
      projectId,
      gitlabProjectId,
    );
  }

  @Get('/projects/orgs/:orgId/')
  async getProject(@Param('orgId') orgId: string) {
    return await this.gitlabService.getProjects(orgId);
  }

  @Post()
  async handleWebhook(
    @Body() payload: MergeRequestEvent | PushEvent,
    @Headers('x-gitlab-event') eventType: string,
    @Headers('x-gitlab-token') token: string,
  ) {
    // Verify webhook token
    if (token !== 'your-secret-token') {
      throw new UnauthorizedException('Invalid webhook token');
    }

    switch (eventType) {
      case 'Push Hook': {
        const pushEvent = payload as PushEvent;
        // Check if this is a new branch
        if (pushEvent.before === '0000000000000000000000000') {
          const branchName = pushEvent.ref.replace('refs/heads/', '');
          console.log(`New branch created: ${branchName}`);
          // Handle new branch logic here
        }
        break;
      }

      case 'Merge Request Hook': {
        const mrEvent = payload as MergeRequestEvent;
        switch (mrEvent.object_attributes.action) {
          case 'open':
            console.log(`New MR opened: ${mrEvent.object_attributes.title}`);
            // Handle new MR logic
            break;
          case 'merge':
            console.log(`MR merged: ${mrEvent.object_attributes.title}`);
            // Handle merged MR logic
            break;
          case 'close':
            console.log(`MR closed: ${mrEvent.object_attributes.title}`);
            // Handle closed MR logic
            break;
        }
        break;
      }
    }
  }
}
