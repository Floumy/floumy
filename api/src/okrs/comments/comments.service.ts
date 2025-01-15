import { Injectable } from '@nestjs/common';
import { KeyResult } from '../key-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { KeyResultComment } from '../key-result-comment.entity';
import { User } from '../../users/user.entity';
import { CommentMapper } from '../../comments/mappers';
import { ObjectiveComment } from '../objective-comment.entity';
import { Objective } from '../objective.entity';
import { CreateNotificationDto } from '../../notifications/dtos';
import {
  ActionType,
  EntityType,
  StatusType,
} from '../../notifications/notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
    private eventEmitter: EventEmitter2,
  ) {}

  async addCommentToKeyResult(
    orgId: string,
    projectId: string,
    keyResultId: string,
    userId: string,
    content: string,
    mentions: string[],
  ) {
    const keyResult = await this.keyResultRepository.findOneByOrFail({
      id: keyResultId,
      org: { id: orgId },
      project: { id: projectId },
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
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(mentions),
      }),
    );
    const savedComment = await this.keyResultCommentRepository.save(comment);
    const savedMentions = await savedComment.mentions;
    if (savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: await this.usersRepository.findOneByOrFail({ id: userId }),
        org: org,
        project: await keyResult.project,
        action: ActionType.CREATE,
        entity: EntityType.KEY_RESULT_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(comment);
  }

  async updateKeyResultComment(
    orgId: string,
    projectId: string,
    userId: string,
    commentId: string,
    content: string,
    mentions: string[],
  ) {
    const comment = await this.keyResultCommentRepository.findOneByOrFail({
      id: commentId,
      createdBy: { id: userId },
      keyResult: {
        org: { id: orgId },
        project: { id: projectId },
      },
    });

    if (!content || content.trim() === '') {
      throw new Error('Comment content is required');
    }

    comment.content = content;
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(mentions),
      }),
    );
    const savedComment = await this.keyResultCommentRepository.save(comment);
    const savedMentions = await savedComment.mentions;
    if (savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: await this.usersRepository.findOneByOrFail({ id: userId }),
        org: await savedComment.org,
        project: await (await savedComment.keyResult).project,
        action: ActionType.UPDATE,
        entity: EntityType.KEY_RESULT_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }

    return CommentMapper.toDto(comment);
  }

  async deleteKeyResultComment(
    orgId: string,
    projectId: string,
    userId: string,
    commentInd: string,
  ) {
    const comment = await this.keyResultCommentRepository.findOneByOrFail({
      id: commentInd,
      createdBy: { id: userId },
      keyResult: {
        org: { id: orgId },
        project: { id: projectId },
      },
    });

    await this.keyResultCommentRepository.remove(comment);
  }

  async addCommentToObjective(
    orgId: string,
    projectId: string,
    objectiveId: string,
    userId: string,
    content: string,
    mentions: string[],
  ) {
    const objective = await this.objectiveRepository.findOneByOrFail({
      id: objectiveId,
      org: { id: orgId },
      project: { id: projectId },
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
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(mentions),
      }),
    );
    const savedComment = await this.objectiveCommentRepository.save(comment);
    const savedMentions = await savedComment.mentions;
    if (savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: await this.usersRepository.findOneByOrFail({ id: userId }),
        org: org,
        project: await objective.project,
        action: ActionType.CREATE,
        entity: EntityType.OBJECTIVE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(comment);
  }

  async updateObjectiveComment(
    orgId: string,
    projectId: string,
    userId: string,
    commentId: string,
    content: string,
    mentions: string[],
  ) {
    const comment = await this.objectiveCommentRepository.findOneByOrFail({
      id: commentId,
      createdBy: { id: userId },
      objective: {
        org: { id: orgId },
        project: { id: projectId },
      },
    });

    if (!content || content.trim() === '') {
      throw new Error('Comment content is required');
    }

    comment.content = content;
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(mentions),
      }),
    );
    const savedComment = await this.objectiveCommentRepository.save(comment);
    const savedMentions = await savedComment.mentions;
    if (savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: await this.usersRepository.findOneByOrFail({ id: userId }),
        org: await savedComment.org,
        project: await (await savedComment.objective).project,
        action: ActionType.UPDATE,
        entity: EntityType.OBJECTIVE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(comment);
  }

  async deleteObjectiveComment(
    orgId: string,
    projectId: string,
    userId: string,
    commentId: string,
  ) {
    const comment = await this.objectiveCommentRepository.findOneByOrFail({
      id: commentId,
      createdBy: { id: userId },
      objective: {
        org: { id: orgId },
        project: { id: projectId },
      },
    });

    await this.objectiveCommentRepository.remove(comment);
  }
}
