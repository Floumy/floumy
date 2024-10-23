import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from '../../files/file.entity';
import { Feature } from './feature.entity';

@Entity()
export class FeatureFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Feature, (feature) => feature.featureFiles, { lazy: true })
  feature: Promise<Feature>;

  @OneToOne(() => File, { lazy: true })
  @JoinColumn()
  file: Promise<File>;
}
