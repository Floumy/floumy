import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Org } from "../orgs/org.entity";
import { WorkItem } from "../backlog/work-items/work-item.entity";

@Entity()
export class Iteration {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  title: string;
  @Column()
  goal: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column()
  duration: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.iterations, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => WorkItem, workItem => workItem.iteration, { lazy: true })
  workItems: Promise<WorkItem[]>;
}
