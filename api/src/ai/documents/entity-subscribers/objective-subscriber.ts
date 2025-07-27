import { Objective } from '../../../okrs/objective.entity';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  Repository,
  UpdateEvent,
} from 'typeorm';
import { IndexingService } from '../indexing.service';
import { InjectRepository } from '@nestjs/typeorm';

@EventSubscriber()
export class ObjectiveSubscriber
  implements EntitySubscriberInterface<Objective>
{
  constructor(
    dataSource: DataSource,
    private indexingService: IndexingService,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Objective;
  }

  async afterInsert(event: InsertEvent<Objective>) {
    await this.indexingService.indexObjective(event.entity);
  }

  async beforeRemove(event: RemoveEvent<Objective>) {
    await this.indexingService.deleteEntityIndex(event.entityId);
  }

  async afterUpdate(event: UpdateEvent<Objective>) {
    const updatedObjective = await this.objectiveRepository.findOne({
      where: {
        id: event.databaseEntity.id,
      },
    });
    await this.indexingService.updateObjectiveIndex(updatedObjective);
  }
}
