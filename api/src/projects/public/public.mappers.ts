import { Project } from '../project.entity';
import { BipSettings } from '../../bip/bip-settings.entity';

export class ProjectMapper {
  static async toDto(project: Project) {
    const bipSettings = await project.bipSettings;
    return {
      id: project.id,
      name: project.name,
      bipSettings: BipSettingsMapper.toDto(bipSettings),
    };
  }
}

export class BipSettingsMapper {
  static toDto(bipSettings: BipSettings) {
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