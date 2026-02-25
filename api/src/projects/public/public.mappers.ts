import { Project } from '../project.entity';
import { BipSettings } from '../../bip/bip-settings.entity';

export class ProjectMapper {
  static async toDto(project: Project) {
    const bipSettings = await project.bipSettings;
    return {
      id: project.id,
      name: project.name,
      cyclesEnabled: project.cyclesEnabled,
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
      isCyclesPagePublic: bipSettings.isCyclesPagePublic,
      isActiveCyclesPagePublic: bipSettings.isActiveCyclesPagePublic,
      isActiveWorkPagePublic: bipSettings.isActiveWorkPagePublic,
      isIssuesPagePublic: bipSettings.isIssuesPagePublic,
      isRequestsPagePublic: bipSettings.isRequestsPagePublic,
    };
  }
}
