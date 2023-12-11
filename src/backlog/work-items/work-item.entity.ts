import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Priority } from "../../common/priority.enum";
import { WorkItemStatus } from "./workt-item-status.enum";
import { Org } from "../../orgs/org.entity";
import { Feature } from "../../roadmap/features/feature.entity";
import { WorkItemType } from "./work-item-type.enum";

@Entity()
export class WorkItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({
    type: "enum",
    enum: WorkItemType,
    default: WorkItemType.USER_STORY
  })
  type: WorkItemType;
  @Column({
    type: "enum",
    enum: Priority,
    default: Priority.MEDIUM
  })
  priority: Priority;
  @Column({
    type: "enum",
    enum: WorkItemStatus,
    default: WorkItemStatus.BACKLOG
  })
  status: WorkItemStatus;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.workItems, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => Feature, feature => feature.workItems, { lazy: true })
  feature: Promise<Feature>;
}
