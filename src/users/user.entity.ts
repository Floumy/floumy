import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { RefreshToken } from "../auth/refresh-token.entity";
import { Org } from "../orgs/org.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user, { cascade: true, lazy: true })
  refreshTokens: Promise<RefreshToken[]>;
  @ManyToOne(() => Org, org => org.users, { lazy: true })
  org: Promise<Org>;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
