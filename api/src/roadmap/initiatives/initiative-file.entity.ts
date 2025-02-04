import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from '../../files/file.entity';
import { Initiative } from './initiative.entity';

@Entity()
export class InitiativeFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Initiative, (initiative) => initiative.initiativeFiles, { lazy: true })
  initiatives: Promise<Initiative>;

  @OneToOne(() => File, { lazy: true })
  @JoinColumn()
  file: Promise<File>;
}
