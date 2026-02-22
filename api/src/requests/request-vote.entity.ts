import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Request } from './request.entity';
import { User } from '../users/user.entity';

@Entity('request_vote')
export class RequestVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  vote: number;

  @ManyToOne(() => User, (user) => user.requestVotes, { lazy: false })
  user: Promise<User>;

  @ManyToOne(() => Request, (request) => request.votes, {
    lazy: false,
  })
  request: Promise<Request>;

  createdAt: Date;
}
