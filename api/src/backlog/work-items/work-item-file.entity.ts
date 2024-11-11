import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkItem } from './work-item.entity';
import { File } from '../../files/file.entity';

@Entity()
export class WorkItemFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkItem, (workItem) => workItem.workItemFiles, {
    lazy: true,
  })
  workItem: Promise<WorkItem>;

  @OneToOne(() => File, { lazy: true })
  @JoinColumn()
  file: Promise<File>;
}
