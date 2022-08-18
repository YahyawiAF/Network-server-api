import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { User } from "./User";
import { Ticket } from "./Tickets";

enum ACTIVITYTYPE {
  OPENED = "open",
  JOINED = "joined",
  LEFT = "left",
  TRANSFERED = "transfered",
  INVITED = "invited",
  SOLVED = "sloved",
  CLOSED = "closed",
}

@Entity("ticketsActivity")
@ObjectType()
export class TicketActivity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @ManyToOne(() => User, (user: any) => user.tickets)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: false })
  user_id: String;

  @Field(() => String)
  @Column({ type: "enum", enum: ACTIVITYTYPE, nullable: true })
  activity_type: ACTIVITYTYPE;

  @ManyToOne(() => User, (user: any) => user.id, { nullable: true })
  @JoinColumn()
  invitedUser: User;

  @ManyToOne(() => Ticket, (ticket: any) => ticket.id, {
    onDelete: "CASCADE",
  })
  ticket: Ticket;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date();
}
