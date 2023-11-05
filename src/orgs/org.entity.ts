import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";

@Entity()
export class Org {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @OneToMany(() => User, user => user.org)
  users: User[];
}
