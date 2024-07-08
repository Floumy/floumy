import { Test, TestingModule } from '@nestjs/testing';
import { FeedEventHandler } from './feed.event-handler';

describe('FeedEventHandler', () => {
  let service: FeedEventHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedEventHandler],
    }).compile();

    service = module.get<FeedEventHandler>(FeedEventHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
