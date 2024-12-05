import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Feature } from '../feature.entity';
import { FeatureMapper } from './public.mappers';
import { Project } from '../../../projects/project.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getFeature(orgId: string, projectId: string, featureId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;

    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new Error('Roadmap page is not public');
    }
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: featureId,
    });
    return await FeatureMapper.toDto(feature);
  }
}
