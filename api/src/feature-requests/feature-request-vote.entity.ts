import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FeatureRequest } from './feature-request.entity';
import { User } from '../users/user.entity';

@Entity()
export class FeatureRequestVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  vote: number;

  @ManyToOne(() => User, (user) => user.featureRequestVotes, { lazy: false })
  user: Promise<User>;

  @ManyToOne(() => FeatureRequest, (featureRequest) => featureRequest.votes, {
    lazy: false,
  })
  featureRequest: Promise<FeatureRequest>;

  createdAt: Date;
}
