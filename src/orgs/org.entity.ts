import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Objective } from "../okrs/objective.entity";
import { KeyResult } from "../okrs/key-result.entity";
import { Feature } from "../roadmap/features/feature.entity";
import { Milestone } from "../roadmap/milestones/milestone.entity";
import { WorkItem } from "../backlog/work-items/work-item.entity";
import { Iteration } from "../iterations/Iteration.entity";
import { File } from "../files/file.entity";

@Entity()
export class Org {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ unique: true, default: () => "uuid_generate_v4()" })
  invitationToken: string;
  @OneToMany(() => User, user => user.org, { lazy: true })
  users: Promise<User[]>;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany(() => Objective, objective => objective.org, { lazy: true })
  objectives: Promise<Objective[]>;
  @OneToMany(() => KeyResult, keyResult => keyResult.org, { lazy: true })
  keyResults: Promise<KeyResult[]>;
  @OneToMany(() => Feature, feature => feature.org, { lazy: true })
  features: Promise<Feature[]>;
  @OneToMany(() => Milestone, milestone => milestone.org, { lazy: true })
  milestones: Promise<Milestone[]>;
  @OneToMany(() => WorkItem, workItem => workItem.org, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @OneToMany(() => Iteration, iteration => iteration.org, { lazy: true })
  iterations: Promise<Iteration[]>;
  @OneToMany(() => File, file => file.org, { lazy: true })
  files: Promise<File[]>;
}
