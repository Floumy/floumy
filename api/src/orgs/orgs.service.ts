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
    org.hadDemo = false;
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
    orgName?: string,
    invitationToken?: string,
  ): Promise<Org> {
    if (invitationToken && invitationToken.trim().length === 0) {
      throw new Error('Invalid invitation token');
    }

    if (invitationToken) {
      return await this.findOneByInvitationToken(invitationToken);
    }

    return await this.createOrg(orgName);
  }

  async patchOrg(orgId: string, name: string) {
    const org = await this.findOneById(orgId);
    org.name = name;
    return await this.orgRepository.save(org);
  }

  private async createOrg(orgName?: string) {
    const org = new Org();
    org.name = orgName;
    org.paymentPlan = PaymentPlan.PREMIUM;
    org.isSubscribed = false;
    org.nextPaymentDate = null;
    org.hadDemo = false;
    const savedOrg = await this.orgRepository.save(org);
    const demoProject = new Project();
    demoProject.name = `${orgName} Demo`;
    demoProject.org = Promise.resolve(savedOrg);
    await this.projectRepository.save(demoProject);
    this.eventEmitter.emit('project.created', demoProject);
    return savedOrg;
  }

  async getUsers(orgId: string) {
    const org = await this.findOneById(orgId);
    const users = await org.users;
    return users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
  }
}
