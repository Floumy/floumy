import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Org } from "../orgs/org.entity";

@Entity()
export class Objective {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  objective: string;
  @Column()
  description: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, org => org.objectives, { lazy: true })
  org: Promise<Org>;
}
