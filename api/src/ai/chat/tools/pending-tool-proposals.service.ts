import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PendingToolProposal } from './pending-tool-proposals.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PendingToolProposalsService {
  constructor(
    @InjectRepository(PendingToolProposal)
    private pendingToolProposalsRepository: Repository<PendingToolProposal>,
  ) {}

  async addPendingToolProposal(
    sessionId: string,
    orgId: string,
    userId: string,
    data: any,
  ) {
    const pendingProposal = new PendingToolProposal();
    pendingProposal.sessionId = sessionId;
    pendingProposal.orgId = orgId;
    pendingProposal.userId = userId;
    pendingProposal.data = this.normalizeJsonbValue(data);
    return await this.pendingToolProposalsRepository.save(pendingProposal);
  }

  private normalizeJsonbValue(value: unknown): unknown {
    // Accept strings (attempt to parse JSON if possible)
    if (typeof value === 'string') {
      try {
        // If it's valid JSON, store parsed; otherwise store the string as-is
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    // For objects/arrays, strip prototypes/undefined/functions via JSON roundtrip
    if (value !== null && typeof value === 'object') {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch (err) {
        // Fall through to throw below
      }
    }

    // Primitives (number, boolean, null) are fine
    if (
      value === null ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    throw new Error('Unsupported data format: value is not JSON-serializable');
  }

  async findPendingToolProposal(
    sessionId: string,
    orgId: string,
    userId: string,
  ) {
    return await this.pendingToolProposalsRepository.findOne({
      where: { sessionId, orgId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async removePendingToolProposal(id: string) {
    await this.pendingToolProposalsRepository.delete({ id });
  }
}
