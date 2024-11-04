import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from './org.entity';
import { OrgsMapper } from './orgs.mapper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentPlan } from '../auth/payment.plan';
import { Product } from '../products/product.entity';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
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

    const product = new Product();
    product.name = 'Default Product';
    product.org = Promise.resolve(savedOrg);
    product.users = Promise.resolve([user]);
    await this.productRepository.save(product);

    this.eventEmitter.emit('org.created', savedOrg);
    return savedOrg;
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

  async getOrCreateOrg(invitationToken?: string): Promise<Org> {
    if (invitationToken && invitationToken.trim().length === 0) {
      throw new Error('Invalid invitation token');
    }

    if (invitationToken) {
      return await this.findOneByInvitationToken(invitationToken);
    }

    return await this.createOrg();
  }

  private async createOrg() {
    const org = new Org();
    org.paymentPlan = PaymentPlan.FREE;
    org.isSubscribed = false;
    org.nextPaymentDate = null;
    const savedOrg = await this.orgRepository.save(org);
    this.eventEmitter.emit('org.created', savedOrg);
    return savedOrg;
  }
}
