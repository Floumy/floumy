import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Org } from "../orgs/org.entity";

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
}
