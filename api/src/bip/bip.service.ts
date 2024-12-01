import { Injectable } from '@nestjs/common';
import { BipSettingsDto } from './bip.dtos';
import { Repository } from 'typeorm';
import { BipSettings } from './bip-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BipSettingsMapper } from './bip.dtos.mapper';
import { Org } from '../orgs/org.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { Project } from '../projects/project.entity';

@Injectable()
export class BipService {
  constructor(
    @InjectRepository(BipSettings)
    private readonly bipSettingsRepository: Repository<BipSettings>,
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async createOrUpdateSettings(
    orgId: string,
    projectId: string,
    settings: BipSettingsDto,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });

    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    return await this.createOrUpdateBuildInPublicSettings(
      org,
      project,
      settings,
    );
  }

  async getSettings(orgId: string, projectId: string) {
    const bipSettings = await this.bipSettingsRepository.findOneBy({
      org: { id: orgId },
      project: { id: projectId },
    });
    return BipSettingsMapper.toDto(bipSettings);
  }

  // TODO: Extract this in an event handler class
  @OnEvent('project.created')
  async createSettings(projectEvent: Project) {
    const project = await this.projectsRepository.findOneBy({
      id: projectEvent.id,
    });

    if (!project) {
      return;
    }

    if (await project.bipSettings) {
      return;
    }

    const bipSettings = new BipSettings();
    const org = await project.org;
    bipSettings.org = Promise.resolve(org);
    bipSettings.project = Promise.resolve(project);
    await this.bipSettingsRepository.save(bipSettings);
  }

  async createOrUpdateBuildInPublicSettings(
    org: Org,
    project: Project,
    settings: BipSettingsDto,
  ) {
    let bipSettings = await this.bipSettingsRepository.findOneBy({
      org: { id: org.id },
      project: { id: project.id },
    });

    if (!bipSettings) {
      bipSettings = new BipSettings();
    }
    bipSettings.org = Promise.resolve(org);
    bipSettings.project = Promise.resolve(project);
    bipSettings.isBuildInPublicEnabled = settings.isBuildInPublicEnabled;
    bipSettings.isObjectivesPagePublic = settings.isObjectivesPagePublic;
    bipSettings.isRoadmapPagePublic = settings.isRoadmapPagePublic;
    bipSettings.isIterationsPagePublic = settings.isIterationsPagePublic;
    bipSettings.isActiveIterationsPagePublic =
      settings.isActiveIterationsPagePublic;
    bipSettings.isFeedPagePublic = settings.isFeedPagePublic;
    bipSettings.isFeatureRequestsPagePublic =
      settings.isFeatureRequestsPagePublic;
    bipSettings.isIssuesPagePublic = settings.isIssuesPagePublic;
    const updatedSettings = await this.bipSettingsRepository.save(bipSettings);
    return BipSettingsMapper.toDto(updatedSettings);
  }
}
