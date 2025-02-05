import { BipSettings } from './bip-settings.entity';

export class BipSettingsMapper {
  static toDto(bipSettings: BipSettings) {
    return {
      isBuildInPublicEnabled: bipSettings.isBuildInPublicEnabled,
      isObjectivesPagePublic: bipSettings.isObjectivesPagePublic,
      isRoadmapPagePublic: bipSettings.isRoadmapPagePublic,
      isSprintsPagePublic: bipSettings.isSprintsPagePublic,
      isActiveSprintsPagePublic: bipSettings.isActiveSprintsPagePublic,
      isFeedPagePublic: bipSettings.isFeedPagePublic,
      isIssuesPagePublic: bipSettings.isIssuesPagePublic,
      isFeatureRequestsPagePublic: bipSettings.isFeatureRequestsPagePublic,
    };
  }
}
