import { Injectable } from '@nestjs/common';
import {
  CreateFeatureRequestDto,
  FeatureRequestDto,
  UpdateFeatureRequestDto,
} from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureRequest } from './feature-request.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { PaymentPlan } from '../auth/payment.plan';
import { FeatureRequestsMapper } from './feature-requests.mapper';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { FeatureRequestVote } from './feature-request-vote.entity';

@Injectable()
export class FeatureRequestsService {
  constructor(
    @InjectRepository(FeatureRequest)
    private featureRequestRepository: Repository<FeatureRequest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Org)
    private orgsRepository: Repository<Org>,
    @InjectRepository(FeatureRequestVote)
    private featureRequestVotesRepository: Repository<FeatureRequestVote>,
  ) {}

  async addFeatureRequest(
    userId: string,
    orgId: string,
    createFeatureRequestDto: CreateFeatureRequestDto,
  ): Promise<FeatureRequestDto> {
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
    featureRequest.votesCount = 1;
    const savedFeatureRequest =
      await this.featureRequestRepository.save(featureRequest);

    const featureRequestVote = new FeatureRequestVote();
    featureRequestVote.user = Promise.resolve(user);
    featureRequestVote.featureRequest = Promise.resolve(savedFeatureRequest);
    featureRequestVote.vote = 1;
    await this.featureRequestVotesRepository.save(featureRequestVote);

    return await FeatureRequestsMapper.toFeatureRequestDto(savedFeatureRequest);
  }

  async listFeatureRequests(
    orgId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });

    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade your plan to view feature requests');
    }

    const featureRequests = await this.featureRequestRepository.find({
      where: { org: { id: orgId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { votesCount: 'DESC', createdAt: 'DESC' },
    });

    return Promise.all(
      featureRequests.map(FeatureRequestsMapper.toFeatureRequestDto),
    );
  }

  async getFeatureRequestById(
    orgId: string,
    featureRequestId: string,
  ): Promise<FeatureRequestDto> {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });

    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade your plan to view feature requests');
    }

    const featureRequest = await this.featureRequestRepository.findOneOrFail({
      where: {
        id: featureRequestId,
        org: { id: orgId },
      },
    });
    return await FeatureRequestsMapper.toFeatureRequestDto(featureRequest);
  }

  async updateFeatureRequest(
    userId: string,
    orgId: string,
    featureRequestId: string,
    updateFeatureRequestDto: UpdateFeatureRequestDto,
  ): Promise<FeatureRequestDto> {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error(
        'You need to upgrade your plan to update a feature request',
      );
    }

    const featureRequest = await this.featureRequestRepository.findOneOrFail({
      where: {
        id: featureRequestId,
        org: { id: orgId },
      },
    });

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequestOrg = await featureRequest.org;
    const userOrg = await user.org;
    if (featureRequestOrg.id !== userOrg.id) {
      throw new Error('You are not allowed to update this feature request');
    }

    featureRequest.title = updateFeatureRequestDto.title;
    featureRequest.description = updateFeatureRequestDto.description;
    featureRequest.status = updateFeatureRequestDto.status;
    featureRequest.estimation = updateFeatureRequestDto.estimation;

    if (featureRequest.status === FeatureRequestStatus.COMPLETED) {
      featureRequest.completedAt = new Date();
    }

    const savedFeature =
      await this.featureRequestRepository.save(featureRequest);
    return await FeatureRequestsMapper.toFeatureRequestDto(savedFeature);
  }

  async deleteFeatureRequest(
    userId: string,
    orgId: string,
    featureRequestId: string,
  ) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error(
        'You need to upgrade your plan to delete a feature request',
      );
    }

    const featureRequest = await this.featureRequestRepository.findOneOrFail({
      where: {
        id: featureRequestId,
        org: { id: orgId },
      },
    });

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequestOrg = await featureRequest.org;
    const userOrg = await user.org;
    if (featureRequestOrg.id !== userOrg.id) {
      throw new Error('You are not allowed to delete this feature request');
    }

    await this.featureRequestRepository.remove(featureRequest);
  }
}
