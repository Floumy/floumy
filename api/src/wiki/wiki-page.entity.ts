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
export class WikiPage {
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
  @ManyToOne(() => WikiPage, (wikiPage) => wikiPage.children, {
    nullable: true,
  })
  parent: WikiPage;
  @RelationId((wikiPage: WikiPage) => wikiPage.parent)
  parentId: string | null;
  @OneToMany(() => WikiPage, (wikiPage) => wikiPage.parent)
  children: WikiPage[];
  @ManyToOne(() => Project, (project) => project.wikiPages, { eager: true })
  project: Project;
}
