import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingToolProposal } from './pending-tool-proposals.entity';
import { PendingToolProposalsService } from './pending-tool-proposals.service';
import { setupTestingModule } from '../../../../test/test.utils';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuidV4 } from 'uuid';

describe('PendingToolProposalsService (integration)', () => {
  let module: TestingModule;
  let service: PendingToolProposalsService;
  let repo: Repository<PendingToolProposal>;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const setup = await setupTestingModule(
      [TypeOrmModule.forFeature([PendingToolProposal])],
      [PendingToolProposalsService],
    );
    module = setup.module;
    cleanup = setup.cleanup;
    service = module.get(PendingToolProposalsService);
    repo = module.get<Repository<PendingToolProposal>>(
      getRepositoryToken(PendingToolProposal),
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await module.close();
  });

  it('persists and retrieves a proposal with normalized data', async () => {
    const sessionId = uuidV4();
    const orgId = uuidV4();
    const userId = uuidV4();

    const projectId = uuidV4();
    const saved = await service.addPendingToolProposal(
      sessionId,
      orgId,
      userId,
      {
        projectId: projectId,
        title: 'Title',
        description: 'Description',
        type: 'task',
      },
    );

    expect(saved.id).toBeDefined();

    const found = await service.findPendingToolProposal(
      sessionId,
      orgId,
      userId,
    );
    expect(found).toBeDefined();
    expect(found!.id).toEqual(saved.id);
    expect(found!.data).toEqual({
      projectId: projectId.toString(),
      title: 'Title',
      description: 'Description',
      type: 'task',
    });

    const inDb = await repo.findOne({ where: { id: saved.id } });
    expect(inDb).toBeDefined();
    expect(inDb!.data).toEqual({
      projectId: projectId.toString(),
      title: 'Title',
      description: 'Description',
      type: 'task',
    });
  });

  it('returns the most recent proposal for same session/org/user', async () => {
    const sessionId = uuidV4();
    const orgId = uuidV4();
    const userId = uuidV4();

    const payload1 = { order: 1 };
    await service.addPendingToolProposal(sessionId, orgId, userId, payload1);

    // Ensure createdAt differs
    await new Promise((r) => setTimeout(r, 10));

    const second = await service.addPendingToolProposal(
      sessionId,
      orgId,
      userId,
      { order: 2 },
    );

    const latest = await service.findPendingToolProposal(
      sessionId,
      orgId,
      userId,
    );
    expect(latest).toBeDefined();
    expect(latest!.id).toEqual(second.id);
    expect(latest!.data).toEqual({ order: 2 });

    const all = await repo.find({ where: { sessionId, orgId, userId } });
    expect(all.length).toBe(2);
  });

  it('removes an existing proposal', async () => {
    const sessionId = uuidV4();
    const orgId = uuidV4();
    const userId = uuidV4();

    const saved = await service.addPendingToolProposal(
      sessionId,
      orgId,
      userId,
      { toDelete: true },
    );

    await service.removePendingToolProposal(saved.id);

    const found = await repo.findOne({ where: { id: saved.id } });
    expect(found).toBeNull();
  });
});
