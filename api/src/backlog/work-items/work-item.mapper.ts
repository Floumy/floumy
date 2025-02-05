import { WorkItem } from './work-item.entity';
import { SearchWorkItem, SearchWorkItemDto, WorkItemDto } from './dtos';
import { Feature } from '../../roadmap/features/feature.entity';
import { Sprint } from '../../sprints/sprint.entity';
import { User } from '../../users/user.entity';
import { GithubPullRequest } from '../../github/github-pull-request.entity';

class FeatureMapper {
  static toDto(feature: Feature) {
    return {
      id: feature.id,
      title: feature.title,
    };
  }
}

class SprintMapper {
  static toDto(sprint: Sprint) {
    return {
      id: sprint.id,
      title: sprint.title,
    };
  }
}

class UserMapper {
  static toDto(user: User) {
    return {
      id: user.id,
      name: user.name,
    };
  }
}

export default class WorkItemMapper {
  static async toDto(workItem: WorkItem): Promise<WorkItemDto> {
    const feature = await workItem.feature;
    const sprint = await workItem.sprint;
    const createdBy = await workItem.createdBy;
    const assignedTo = await workItem.assignedTo;
    const issue = await workItem.issue;
    const org = await workItem.org;
    const project = await workItem.project;
    const pullRequests = await workItem.githubPullRequests;
    return {
      id: workItem.id,
      org: org ? { id: org.id } : undefined,
      project: { id: project.id },
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      feature: feature ? FeatureMapper.toDto(feature) : undefined,
      sprint: sprint ? SprintMapper.toDto(sprint) : undefined,
      files: await Promise.all(
        (await workItem.workItemFiles).map(async (workItemFile) => {
          const file = await workItemFile.file;
          return {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
          };
        }),
      ),
      createdBy: createdBy ? UserMapper.toDto(createdBy) : undefined,
      assignedTo: assignedTo ? UserMapper.toDto(assignedTo) : undefined,
      issue: issue
        ? {
            id: issue.id,
            title: issue.title,
          }
        : undefined,
      pullRequests: pullRequests
        ? PullRequestMapper.toDto(pullRequests)
        : undefined,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }

  static async toListItemDto(workItem: WorkItem) {
    const feature = await workItem.feature;
    const assignedTo = await workItem.assignedTo;
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      feature: feature ? FeatureMapper.toDto(feature) : undefined,
      assignedTo: assignedTo ? UserMapper.toDto(assignedTo) : undefined,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }

  static async toListDto(workItems: WorkItem[]) {
    return await Promise.all(workItems.map(this.toListItemDto));
  }

  static toSimpleListDto(workItems: WorkItem[]) {
    return workItems.map(this.toSimpleListItemDto);
  }

  static toSimpleListItemDto(workItem: WorkItem) {
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }

  static toSearchListDto(workItems: SearchWorkItem[]): SearchWorkItemDto[] {
    return workItems.map(WorkItemMapper.toSearchListItemDto);
  }
  static toSearchListItemDto(workItem: SearchWorkItem): SearchWorkItemDto {
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      assignedTo: {
        id: workItem.assignedToId,
        name: workItem.assignedToName,
      },
      estimation: workItem.estimation,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}

class PullRequestMapper {
  static toDto(pullRequests: GithubPullRequest[]) {
    return pullRequests.map((pullRequest) => {
      return {
        id: pullRequest.id,
        title: pullRequest.title,
        url: pullRequest.url,
        state: pullRequest.state,
        createdAt: pullRequest.createdAt,
        updatedAt: pullRequest.updatedAt,
      };
    });
  }
}
