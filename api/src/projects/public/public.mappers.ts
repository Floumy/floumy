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
      isSprintsPagePublic: bipSettings.isSprintsPagePublic,
      isActiveSprintsPagePublic: bipSettings.isActiveSprintsPagePublic,
      isIssuesPagePublic: bipSettings.isIssuesPagePublic,
      isFeatureRequestsPagePublic: bipSettings.isFeatureRequestsPagePublic,
    };
  }
}
