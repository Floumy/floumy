import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Project } from '../../projects/project.entity';

@Entity()
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  sessionId: string;
  @Column()
  createdAt: Date;
  @ManyToOne(() => User, (user) => user.chatHistoryItems, { lazy: true })
  user: Promise<User>;
  @ManyToOne(() => Project, (project) => project.historyItems, { lazy: true })
  project: Promise<Project>;
}
