import { Injectable } from '@nestjs/common';
import { PaymentPlan } from '../../auth/payment.plan';
import { KeyResult } from '../key-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyResultComment } from '../key-result-comment.entity';
import { User } from '../../users/user.entity';

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
    await this.keyResultCommentRepository.save(comment);
    return comment;
  }
}
