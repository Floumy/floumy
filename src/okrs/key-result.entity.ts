import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Objective } from "./objective.entity";
import { OKRStatus } from "./OKRStatus.enum";
import { Org } from "../orgs/org.entity";

@Entity()
export class KeyResult {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  title: string;
  @Column({ default: 0, type: "float" })
  progress: number;
  @Column({
    type: "enum",
    enum: OKRStatus,
    default: OKRStatus.ON_TRACK
  })
  status: OKRStatus;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.keyResults, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => Objective, objective => objective.keyResults, { lazy: true })
  objective: Promise<Objective>;
}
