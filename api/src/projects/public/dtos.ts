export interface ProjectDto {
  id: string;
  name: string;
  bipSettings: BipSettingsDto;
}

export interface BipSettingsDto {
  isBuildInPublicEnabled: boolean;
  isObjectivesPagePublic: boolean;
  isRoadmapPagePublic: boolean;
  isSprintsPagePublic: boolean;
  isActiveSprintsPagePublic: boolean;
  isFeedPagePublic: boolean;
  isIssuesPagePublic: boolean;
  isFeatureRequestsPagePublic: boolean;
}