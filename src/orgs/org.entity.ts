import { CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Objective } from "../okrs/objective.entity";

@Entity()
export class Org {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @OneToMany(() => User, user => user.org)
  users: User[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany(() => Objective, objective => objective.org)
  objectives: Promise<Objective[]>;
}
