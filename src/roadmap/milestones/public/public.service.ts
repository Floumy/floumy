import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Timeline } from '../../../common/timeline.enum';
import { MilestonesService } from '../milestones.service';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    private milestoneService: MilestonesService,
  ) {}

  async listMilestones(orgId: string, timeline: Timeline) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const bipSettings = await org.bipSettings;
    if (
      !bipSettings?.isRoadmapPagePublic ||
      !bipSettings?.isBuildInPublicEnabled
    ) {
      throw new Error('Roadmap page is not public');
    }
    return this.milestoneService.listForTimeline(orgId, timeline);
  }
}
