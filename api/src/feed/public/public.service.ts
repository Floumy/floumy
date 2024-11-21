import { Injectable } from '@nestjs/common';
import { FeedService } from '../feed.service';
import { FeedItemDto } from '../dtos';
import { Project } from '../../projects/project.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PublicService {
  constructor(
    private readonly feedService: FeedService,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async listFeedItems(
    orgId: string,
    projectId: string,
    page: number,
    limit: number,
  ): Promise<FeedItemDto[]> {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;

    if (
      bipSettings?.isBuildInPublicEnabled !== true ||
      bipSettings?.isFeedPagePublic !== true
    ) {
      throw new Error('Feed page is not public');
    }

    const feedItems = await this.feedService.listFeedItems(
      orgId,
      projectId,
      page,
      limit,
    );

    // Remove assignedTo from the feed items
    return feedItems.map((item: FeedItemDto) => {
      delete item?.content?.assignedTo;
      delete item?.content?.current?.assignedTo;
      delete item?.content?.current?.assignedTo;
      return item;
    });
  }
}
