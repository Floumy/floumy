import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Org } from "../orgs/org.entity";
import { WorkItemFile } from "../backlog/work-items/work-item-file.entity";

@Entity()
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Org, org => org.files, { lazy: true })
  org: Promise<Org>;

  @OneToOne(() => WorkItemFile)
  @JoinColumn()
  workItemFiles: Promise<WorkItemFile>;
}
