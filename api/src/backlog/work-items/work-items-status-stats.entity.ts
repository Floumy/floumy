import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkItem } from './work-item.entity';

@Entity()
export class WorkItemsStatusStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ default: 0 })
  planned: number;
  @Column({ default: 0 })
  readyToStart: number;
  @Column({ default: 0 })
  inProgress: number;
  @Column({ default: 0 })
  blocked: number;
  @Column({ default: 0 })
  codeReview: number;
  @Column({ default: 0 })
  testing: number;
  @Column({ default: 0 })
  revisions: number;
  @Column({ default: 0 })
  readyForDeployment: number;
  @Column({ default: 0 })
  deployed: number;
  @Column({ default: 0 })
  done: number;
  @Column({ default: 0 })
  closed: number;
  @OneToOne(() => WorkItem, (workItem) => workItem.workItemsStatusStats, {
    lazy: true,
  })
  workItem: Promise<WorkItem>;
}
