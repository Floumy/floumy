import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from '../../../orgs/org.entity';
import { WorkItem } from '../work-item.entity';
import { PublicWorkItemMapper } from './public.mappers';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
  ) {}

  async getWorkItem(orgId: string, workItemId: string) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const bipSettings = await org.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new NotFoundException();
    }
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
    });
    return PublicWorkItemMapper.toDto(workItem);
  }
}
