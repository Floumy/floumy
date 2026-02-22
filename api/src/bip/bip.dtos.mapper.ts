import { BipSettings } from './bip-settings.entity';

export class BipSettingsMapper {
  static toDto(bipSettings: BipSettings) {
    return {
      isBuildInPublicEnabled: bipSettings.isBuildInPublicEnabled,
      isObjectivesPagePublic: bipSettings.isObjectivesPagePublic,
      isRoadmapPagePublic: bipSettings.isRoadmapPagePublic,
      isCyclesPagePublic: bipSettings.isCyclesPagePublic,
      isActiveCyclesPagePublic: bipSettings.isActiveCyclesPagePublic,
      isIssuesPagePublic: bipSettings.isIssuesPagePublic,
      isRequestsPagePublic: bipSettings.isRequestsPagePublic,
    };
  }
}
