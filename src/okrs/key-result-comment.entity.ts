import { Entity, ManyToOne } from 'typeorm';
import { KeyResult } from './key-result.entity';
import { Comment } from '../comments/comment-entity';

@Entity()
export class KeyResultComment extends Comment {
  @ManyToOne(() => KeyResult, (keyResult) => keyResult.comments, { lazy: true })
  keyResult: Promise<KeyResult>;
}
