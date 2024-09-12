import { Injectable } from '@nestjs/common';
import { IssueDto } from './dtos';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { Issue } from './issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { IssueMapper } from './issue.mapper';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Org)
    private orgsRepository: Repository<Org>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
  ) {}

  async addIssue(userId: string, orgId: string, issueDto: IssueDto) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== 'premium') {
      throw new Error('You need to upgrade your plan to add issues');
    }
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const issue = new Issue();
    issue.title = issueDto.title;
    issue.description = issueDto.description;
    issue.org = Promise.resolve(org);
    issue.createdBy = Promise.resolve(user);
    const savedIssue = await this.issuesRepository.save(issue);
    return IssueMapper.toDto(savedIssue);
  }

  async listIssues(orgId: string, page: number = 1, limit: number = 0) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== 'premium') {
      throw new Error('You need to upgrade your plan to view issues');
    }
    const issues = await this.issuesRepository.find({
      where: { org: { id: orgId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });
    return issues.map(IssueMapper.toDto);
  }

  async getIssueById(orgId: string, issueId: string) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== 'premium') {
      throw new Error('You need to upgrade your plan to view issues');
    }
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
      org: { id: orgId },
    });
    return IssueMapper.toDto(issue);
  }

  async updateIssue(
    userId: string,
    orgId: string,
    issueId: any,
    issueDto: IssueDto,
  ) {
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
      org: { id: orgId },
    });
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const createdBy = await issue.createdBy;
    const userOrg = await user.org;
    if (createdBy.id !== userId || orgId !== userOrg.id) {
      throw new Error('You are not allowed to update this issue');
    }
    const org = await issue.org;
    if (org.paymentPlan !== 'premium') {
      throw new Error('You need to upgrade your plan to update an issue');
    }
    issue.title = issueDto.title;
    issue.description = issueDto.description;
    const savedIssue = await this.issuesRepository.save(issue);
    return IssueMapper.toDto(savedIssue);
  }

  async deleteIssue(userId: string, orgId: string, issueId: string) {
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
      org: { id: orgId },
    });
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const createdBy = await issue.createdBy;
    const userOrg = await user.org;
    if (createdBy.id !== userId || orgId !== userOrg.id) {
      throw new Error('You are not allowed to delete this issue');
    }
    const org = await issue.org;
    if (org.paymentPlan !== 'premium') {
      throw new Error('You need to upgrade your plan to delete an issue');
    }

    await this.issuesRepository.remove(issue);
  }
}
