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
import { IterationStatus } from "./iteration-status.enum";

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
  @Column({ nullable: true })
  actualStartDate: Date;
  @Column({ nullable: true })
  actualEndDate: Date;
  @Column()
  duration: number;
  @Column({ nullable: true })
  velocity: number;
  @Column({
    type: "enum",
    enum: IterationStatus,
    default: IterationStatus.PLANNED
  })
  status: IterationStatus;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.iterations, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => WorkItem, workItem => workItem.iteration, { lazy: false })
  workItems: Promise<WorkItem[]>;
}
