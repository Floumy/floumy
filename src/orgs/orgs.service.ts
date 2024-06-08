import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from './org.entity';
import { OrgsMapper } from './orgs.mapper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    private eventEmitter: EventEmitter2,
    private stripeService: StripeService,
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

  async getByInvitationTokenOrCreateWithNameAndPlan(
    invitationToken?: string,
    name?: string,
  ): Promise<Org> {
    this.validateGetOrCreateOrg(invitationToken, name);

    if (invitationToken) {
      return await this.findOneByInvitationToken(invitationToken);
    }

    return await this.createOrg(name);
  }

  async saveStripeSubscription(
    customerId: string,
    isSubscribed: boolean,
    nextPaymentDate: number,
  ) {
    const org = await this.orgRepository.findOneByOrFail({
      stripeCustomerId: customerId,
    });
    org.isSubscribed = isSubscribed;
    org.nextPaymentDate = new Date(nextPaymentDate);
    await this.orgRepository.save(org);
  }

  private async createOrg(name: string) {
    const org = new Org();
    org.name = name.trim();
    const stripeCustomer = await this.stripeService.createCustomer(org.name);
    org.stripeCustomerId = stripeCustomer.id;

    const savedOrg = await this.orgRepository.save(org);
    this.eventEmitter.emit('org.created', savedOrg);
    return savedOrg;
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

    if (name && (name.trim().length === 0 || name.trim().length > 50)) {
      throw new Error('Invalid name');
    }
  }
}
