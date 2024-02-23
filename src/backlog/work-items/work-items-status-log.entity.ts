import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class WorkItemsStatusLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  workItemId: string;
  @Column()
  status: string;
  @Column()
  timestamp: Date;
}
