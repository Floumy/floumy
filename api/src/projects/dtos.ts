export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  isBuildInPublicEnabled: boolean;
  gitlabProjectUrl: string;
  githubRepositoryUrl: string;
  createdAt: Date;
  updateAt: Date;
}
