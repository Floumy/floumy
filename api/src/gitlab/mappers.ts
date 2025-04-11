import { GitlabMergeRequest } from './gitlab-merge-request.entity';
import { GithubPullRequestDto } from '../github/dtos';

export class GitlabMergeRequestMapper {
  public static async toDto(
    gitlabMergeRequest: GitlabMergeRequest,
  ): Promise<GithubPullRequestDto> {
    const workItem = await gitlabMergeRequest.workItem;

    return {
      id: gitlabMergeRequest.id,
      title: gitlabMergeRequest.title,
      url: gitlabMergeRequest.url,
      state: gitlabMergeRequest.state,
      workItem: workItem
        ? {
            id: workItem.id,
            title: workItem.title,
            type: workItem.type,
          }
        : null,
      createdAt: gitlabMergeRequest.createdAt,
      updatedAt: gitlabMergeRequest.updatedAt,
    };
  }
}
