import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from './org.entity';
import { OrgsMapper } from './orgs.mapper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentPlan } from '../auth/payment.plan';
import { OrgPatchDto } from './dtos';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * This method is currently used only on tests
   * and will be deprecated in the future
   * @deprecated Use createOrg instead
   * @param user
   */
  async createForUser(user: User) {
    const org = new Org();
    org.users = Promise.resolve([user]);
    const savedOrg = await this.orgRepository.save(org);
    this.eventEmitter.emit('org.created', savedOrg);
    return savedOrg;
  }

  async clear() {
    await this.orgRepository.clear();
  }

  findOneById(orgId: string) {
    return this.orgRepository.findOneByOrFail({ id: orgId });
  }

  async getOrg(orgId: string) {
    const org = await this.findOneById(orgId);
    return await OrgsMapper.toOrg(org);
  }

  async findOneByInvitationToken(invitationToken: string) {
    return await this.orgRepository.findOneBy({ invitationToken });
  }

  async getByInvitationTokenOrCreateWithName(
    invitationToken?: string,
    name?: string,
  ): Promise<Org> {
    this.validateGetOrCreateOrg(invitationToken, name);

    if (invitationToken) {
      return await this.findOneByInvitationToken(invitationToken);
    }

    return await this.createOrg(name);
  }

  async hasActiveSubscription(orgId: string) {
    const org = await this.findOneById(orgId);

    const isTrial = org.paymentPlan === PaymentPlan.TRIAL;
    // The subscription is active if the org is trial and it was created 7 days ago
    if (
      isTrial &&
      org.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000 > Date.now()
    ) {
      return true;
    }

    if (org.isSubscribed && org.nextPaymentDate > new Date()) {
      return true;
    }

    return org.nextPaymentDate > new Date();
  }

  async patchOrg(orgId: string, orgPatchDto: OrgPatchDto) {
    const org = await this.findOneById(orgId);

    this.validateOrgName(orgPatchDto.name);

    if (org.name !== orgPatchDto.name) {
      await this.validateOrgNameIsUnique(orgPatchDto.name);
    }

    if (orgPatchDto.name) {
      org.name = orgPatchDto.name;
    }

    await this.orgRepository.save(org);
  }

  private async createOrg(name: string) {
    await this.validateOrgNameIsUnique(name);
    const org = new Org();
    org.name = name.trim();
    org.paymentPlan = PaymentPlan.TRIAL;
    org.isSubscribed = false;
    org.nextPaymentDate = null;
    const savedOrg = await this.orgRepository.save(org);
    this.eventEmitter.emit('org.created', savedOrg);
    return savedOrg;
  }

  private async validateOrgNameIsUnique(name: string) {
    const org = await this.orgRepository
      .createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', { name })
      .getOne();
    if (org) {
      throw new Error('Name already exists');
    }
  }

  private validateGetOrCreateOrg(invitationToken: string, name: string) {
    if (!invitationToken && !name) {
      throw new Error('Invalid invitation token and name');
    }

    if (invitationToken && name) {
      throw new Error('Invalid invitation token and name');
    }

    if (invitationToken && invitationToken.trim().length === 0) {
      throw new Error('Invalid invitation token');
    }

    this.validateOrgName(name);
  }

  private validateOrgName(name: string) {
    if (name && (name.trim().length === 0 || name.trim().length > 50)) {
      throw new Error('Invalid name');
    }
  }
}
