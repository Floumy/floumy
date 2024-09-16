import { Injectable } from '@nestjs/common';
import { IssueDto } from './dtos';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { Issue } from './issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { IssueMapper } from './issue.mapper';
import { CreateUpdateCommentDto } from '../comments/dtos';
import { PaymentPlan } from '../auth/payment.plan';
import { IssueComment } from './issue-comment.entity';
import { CommentMapper } from '../comments/mappers';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Org)
    private orgsRepository: Repository<Org>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
    @InjectRepository(IssueComment)
    private issueCommentsRepository: Repository<IssueComment>,
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
    return await IssueMapper.toDto(savedIssue);
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
    return await Promise.all(issues.map(IssueMapper.toDto));
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
    return await IssueMapper.toDto(issue);
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
    return await IssueMapper.toDto(savedIssue);
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

  async createIssueComment(
    userId: string,
    issueId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
    });
    const org = await issue.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new IssueComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.issue = Promise.resolve(issue);
    const savedComment = await this.issueCommentsRepository.save(comment);
    return CommentMapper.toDto(savedComment);
  }

  async deleteIssueComment(userId: string, issueId: string, commentId: string) {
    const comment = await this.issueCommentsRepository.findOneByOrFail({
      id: commentId,
      issue: { id: issueId },
      createdBy: { id: userId },
    });
    await this.issueCommentsRepository.remove(comment);
  }

  async updateIssueComment(
    userId: string,
    issueId: string,
    commentId: string,
    updateCommentDto: CreateUpdateCommentDto,
  ) {
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
    });
    const org = await issue.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to update comments');
    }
    if (!updateCommentDto.content || updateCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.issueCommentsRepository.findOneByOrFail({
      id: commentId,
      issue: { id: issueId },
      createdBy: { id: userId },
    });
    comment.content = updateCommentDto.content;
    const savedComment = await this.issueCommentsRepository.save(comment);
    return await CommentMapper.toDto(savedComment);
  }
}
