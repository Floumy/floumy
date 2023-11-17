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
import { KeyResult } from "./key-result.entity";

@Entity()
export class Objective {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({ default: 0, type: "float" })
  progress: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.objectives, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => KeyResult, keyResult => keyResult.objective, { lazy: true })
  keyResults: Promise<KeyResult[]>;
}
