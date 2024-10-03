import { BipSettings } from '../bip-settings.entity';

export class PublicMapper {
  static toPublicSettingsDto(bipSettings: BipSettings) {
    return {
      isBuildInPublicEnabled: bipSettings.isBuildInPublicEnabled,
      isObjectivesPagePublic: bipSettings.isObjectivesPagePublic,
      isRoadmapPagePublic: bipSettings.isRoadmapPagePublic,
      isIterationsPagePublic: bipSettings.isIterationsPagePublic,
      isActiveIterationsPagePublic: bipSettings.isActiveIterationsPagePublic,
      isFeedPagePublic: bipSettings.isFeedPagePublic,
      isIssuesPagePublic: bipSettings.isIssuesPagePublic,
      isFeatureRequestsPagePublic: bipSettings.isFeatureRequestsPagePublic,
    };
  }
}
