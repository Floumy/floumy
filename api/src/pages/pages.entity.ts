import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ default: null, nullable: true })
  title: string;
  @Column({ default: null, nullable: true })
  content: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Page, (page) => page.children, {
    nullable: true,
  })
  parent: Page;
  @RelationId((page: Page) => page.parent)
  parentId: string | null;
  @OneToMany(() => Page, (page) => page.parent)
  children: Page[];
  @ManyToOne(() => Project, (project) => project.pages, { eager: true })
  project: Project;
}
