import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pending_tool_proposals')
export class PendingToolProposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  orgId: string;

  @Column()
  userId: string;

  @Column('jsonb')
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
