import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FeedEventHandler {
  @OnEvent('workItem.created')
  async handleWorkItemCreated(event: WorkItemDto) {
    // console.log('workItem.created', event);
  }

  @OnEvent('workItem.deleted')
  async handleWorkItemDeleted(event: WorkItemDto) {
    // console.log('workItem.deleted', event);
  }

  @OnEvent('workItem.updated')
  async handleWorkItemUpdated(event: {
    previous: WorkItemDto;
    current: WorkItemDto;
  }) {
    // console.log('workItem.updated', event);
  }
}
