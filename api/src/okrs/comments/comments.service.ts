import { Injectable } from '@nestjs/common';
import { KeyResult } from '../key-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyResultComment } from '../key-result-comment.entity';
import { User } from '../../users/user.entity';
import { CommentMapper } from '../../comments/mappers';
import { ObjectiveComment } from '../objective-comment.entity';
import { Objective } from '../objective.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(KeyResultComment)
    private keyResultCommentRepository: Repository<KeyResultComment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ObjectiveComment)
    private objectiveCommentRepository: Repository<ObjectiveComment>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
  ) {}

  async addCommentToKeyResult(
    orgId: string,
    productId: string,
    keyResultId: string,
    userId: string,
    content: string,
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      org: { id: orgId },
      product: { id: productId },
    });

    const org = await keyResult.org;

    if (!content || content.trim() === '') {
      throw new Error('Comment content is required');
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
    return CommentMapper.toDto(comment);
  }

  async updateKeyResultComment(
    orgId: string,
    productId: string,
    userId: string,
    commentId: string,
    content: string,
  ) {
    const comment = await this.keyResultCommentRepository.findOneByOrFail({
      id: commentId,
      createdBy: { id: userId },
      keyResult: {
        org: { id: orgId },
        product: { id: productId },
      },
    });

    if (!content || content.trim() === '') {
      throw new Error('Comment content is required');
    }

    comment.content = content;

    await this.keyResultCommentRepository.save(comment);

    return CommentMapper.toDto(comment);
  }

  async deleteKeyResultComment(
    orgId: string,
    productId: string,
    userId: string,
    commentInd: string,
  ) {
    const comment = await this.keyResultCommentRepository.findOneByOrFail({
      id: commentInd,
      createdBy: { id: userId },
      keyResult: {
        org: { id: orgId },
        product: { id: productId },
      },
    });

    await this.keyResultCommentRepository.remove(comment);
  }

  async addCommentToObjective(
    orgId: string,
    productId: string,
    objectiveId: string,
    userId: string,
    content: string,
  ) {
    const objective = await this.objectiveRepository.findOneByOrFail({
      id: objectiveId,
      org: { id: orgId },
      product: { id: productId },
    });

    const org = await objective.org;

    if (!content || content.trim() === '') {
      throw new Error('Comment content is required');
    }

    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
    });

    const comment = new ObjectiveComment();
    comment.content = content;
    comment.objective = Promise.resolve(objective);
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    await this.objectiveCommentRepository.save(comment);
    return CommentMapper.toDto(comment);
  }

  async updateObjectiveComment(
    orgId: string,
    productId: string,
    userId: string,
    commentId: string,
    content: string,
  ) {
    const comment = await this.objectiveCommentRepository.findOneByOrFail({
      id: commentId,
      createdBy: { id: userId },
      objective: {
        org: { id: orgId },
        product: { id: productId },
      },
    });

    if (!content || content.trim() === '') {
      throw new Error('Comment content is required');
    }

    comment.content = content;

    await this.objectiveCommentRepository.save(comment);

    return CommentMapper.toDto(comment);
  }

  async deleteObjectiveComment(
    orgId: string,
    productId: string,
    userId: string,
    commentId: string,
  ) {
    const comment = await this.objectiveCommentRepository.findOneByOrFail({
      id: commentId,
      createdBy: { id: userId },
      objective: {
        org: { id: orgId },
        product: { id: productId },
      },
    });

    await this.objectiveCommentRepository.remove(comment);
  }
}
