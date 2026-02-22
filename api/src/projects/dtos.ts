export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  isBuildInPublicEnabled: boolean;
  cyclesEnabled: boolean;
  codeEnabled: boolean;
  gitlabProjectUrl: string;
  githubRepositoryUrl: string;
  createdAt: Date;
  updateAt: Date;
}
