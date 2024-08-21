import { Injectable } from '@nestjs/common';
import { CreateFeatureRequestDto } from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureRequest } from './feature-request.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { PaymentPlan } from '../auth/payment.plan';

@Injectable()
export class FeatureRequestsService {
  constructor(
    @InjectRepository(FeatureRequest)
    private featureRequestRepository: Repository<FeatureRequest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Org)
    private orgsRepository: Repository<Org>,
  ) {}

  async addFeatureRequest(
    userId: string,
    orgId: string,
    createFeatureRequestDto: CreateFeatureRequestDto,
  ) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error(
        'You need to upgrade your plan to create a feature request',
      );
    }

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequest = new FeatureRequest();
    featureRequest.title = createFeatureRequestDto.title;
    featureRequest.description = createFeatureRequestDto.description;
    featureRequest.createdBy = Promise.resolve(user);
    featureRequest.org = Promise.resolve(org);

    return await this.featureRequestRepository.save(featureRequest);
  }
}
