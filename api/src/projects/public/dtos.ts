export interface ProjectDto {
  id: string;
  name: string;
  cyclesEnabled: boolean;
  bipSettings: BipSettingsDto;
}

export interface BipSettingsDto {
  isBuildInPublicEnabled: boolean;
  isObjectivesPagePublic: boolean;
  isRoadmapPagePublic: boolean;
  isCyclesPagePublic: boolean;
  isActiveCyclesPagePublic: boolean;
  isIssuesPagePublic: boolean;
  isRequestsPagePublic: boolean;
}
