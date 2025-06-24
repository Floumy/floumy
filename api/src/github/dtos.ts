export interface GithubPullRequestDto {
  id: string;
  title: string;
  url: string;
  state: string;
  workItem: {
    id: string;
    title: string;
    type: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
