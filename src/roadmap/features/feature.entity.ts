import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Priority } from "../../common/Priority.enum";
import { Org } from "../../orgs/org.entity";
import { FeatureStatus } from "./featurestatus.enum";
import { KeyResult } from "../../okrs/key-result.entity";
import { Timeline } from "../../common/timeline.enum";

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
  @Column({
    type: "enum",
    enum: Timeline,
    default: Timeline.THIS_QUARTER
  })
  timeline: Timeline;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.features, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => KeyResult, keyResult => keyResult.features, { lazy: true })
  keyResult: Promise<KeyResult>;
}
