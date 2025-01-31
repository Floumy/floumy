import { GithubPullRequestDto } from './dtos';
import { GithubPullRequest } from './github-pull-request.entity';

export class GithubPullRequestMapper {
  public static async toDto(
    githubPullRequest: GithubPullRequest,
  ): Promise<GithubPullRequestDto> {
    const workItem = await githubPullRequest.workItem;

    return {
      id: githubPullRequest.id,
      title: githubPullRequest.title,
      url: githubPullRequest.url,
      state: githubPullRequest.state,
      workItem: workItem
        ? {
            id: workItem.id,
            title: workItem.title,
            type: workItem.type,
          }
        : null,
      createdAt: githubPullRequest.createdAt,
      updatedAt: githubPullRequest.updatedAt,
    };
  }
}
