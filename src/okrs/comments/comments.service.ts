import { Injectable } from '@nestjs/common';
import { PaymentPlan } from '../../auth/payment.plan';
import { KeyResult } from '../key-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyResultComment } from '../key-result-comment.entity';
import { User } from '../../users/user.entity';
import { CommentMapper } from '../../comments/mappers';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(KeyResultComment)
    private keyResultCommentRepository: Repository<KeyResultComment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async addCommentToKeyResult(
    keyResultId: string,
    userId: string,
    content: string,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
    });

    const org = await keyResult.org;

    if (org?.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }

    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
    });

    const comment = new KeyResultComment();
    comment.content = content;
    comment.keyResult = Promise.resolve(keyResult);
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    await this.keyResultCommentRepository.save(comment);
    return comment;
  }

  async updateComment(userId: string, commentId: string, content: string) {
    const comment = await this.keyResultCommentRepository.findOneByOrFail({
      id: commentId,
      createdBy: { id: userId },
    });

    const org = await comment.org;

    if (org?.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to update comments');
    }

    comment.content = content;

    await this.keyResultCommentRepository.save(comment);

    return CommentMapper.toDto(comment);
  }

  async deleteComment(userId: string, commentInd: string) {
    const comment = await this.keyResultCommentRepository.findOneByOrFail({
      id: commentInd,
      createdBy: { id: userId },
    });

    const org = await comment.org;

    if (org?.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to delete comments');
    }

    await this.keyResultCommentRepository.remove(comment);
  }
}
