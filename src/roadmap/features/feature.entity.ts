import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Org } from "../../orgs/org.entity";
import { FeatureStatus } from "./featurestatus.enum";
import { KeyResult } from "../../okrs/key-result.entity";
import { Priority } from "../../common/priority.enum";
import { Milestone } from "../milestones/milestone.entity";
import { WorkItem } from "../../backlog/work-items/work-item.entity";

@Entity()
export class Feature {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({
    type: "enum",
    enum: Priority,
    default: Priority.MEDIUM
  })
  priority: Priority;
  @Column({
    type: "enum",
    enum: FeatureStatus,
    default: FeatureStatus.PLANNED
  })
  status: FeatureStatus;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.features, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => KeyResult, keyResult => keyResult.features, { lazy: true })
  keyResult: Promise<KeyResult>;
  @ManyToOne(() => Milestone, milestone => milestone.features, { lazy: true })
  milestone: Promise<Milestone>;
  @OneToMany(() => WorkItem, workItem => workItem.feature, { lazy: true })
  workItems: Promise<WorkItem[]>;
}
