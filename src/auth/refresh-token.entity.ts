import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "../users/user.entity";

@Entity()
export class RefreshToken {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  token: string;

  @Column()
  expirationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, user => user.refreshToken, { lazy: true })
  @JoinColumn()
  user: Promise<User>;

  constructor(token: string) {
    this.token = token;
    // Expires in 7 days
    this.expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
}
