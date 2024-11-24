import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from './org.entity';
import { OrgsMapper } from './orgs.mapper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentPlan } from '../auth/payment.plan';
import { Project } from '../projects/project.entity';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
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
    org.paymentPlan = PaymentPlan.FREE;
    org.users = Promise.resolve([user]);
    const savedOrg = await this.orgRepository.save(org);

    const project = new Project();
    project.name = 'Default Project';
    project.org = Promise.resolve(savedOrg);
    project.users = Promise.resolve([user]);
    await this.projectRepository.save(project);

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

  async getOrCreateOrg(
    projectName?: string,
    invitationToken?: string,
  ): Promise<Org> {
    if (invitationToken && invitationToken.trim().length === 0) {
      throw new Error('Invalid invitation token');
    }

    if (invitationToken) {
      return await this.findOneByInvitationToken(invitationToken);
    }

    return await this.createOrg(projectName);
  }

  async patchOrg(orgId: string, name: string) {
    const org = await this.findOneById(orgId);
    org.name = name;
    const project = new Project();
    project.name = name;
    await this.projectRepository.save(project);
    await this.orgRepository.save(org);
    return org;
  }

  private async createOrg(projectName?: string) {
    const org = new Org();
    org.name = projectName;
    org.paymentPlan = PaymentPlan.PREMIUM;
    org.isSubscribed = false;
    org.nextPaymentDate = null;
    const savedOrg = await this.orgRepository.save(org);
    const project = new Project();
    project.name = projectName;
    project.org = Promise.resolve(savedOrg);
    await this.projectRepository.save(project);
    this.eventEmitter.emit('org.created', savedOrg);
    return savedOrg;
  }
}
