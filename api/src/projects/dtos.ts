export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  gitlabProjectUrl: string;
  githubRepositoryUrl: string;
  createdAt: Date;
  updateAt: Date;
}
