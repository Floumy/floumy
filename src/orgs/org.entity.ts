import { CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Objective } from "../okrs/objective.entity";
import { KeyResult } from "../okrs/key-result.entity";
import { Feature } from "../roadmap/features/feature.entity";

@Entity()
export class Org {
  @PrimaryGeneratedColumn("uuid")
  id: string;
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
}
