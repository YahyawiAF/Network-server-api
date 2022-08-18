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
import { Message } from "./Message";

enum TICKETSTATUS {
  OPEN = "open",
  IN_PROGRESS = "inprogress",
  SOLVED = "solved",
  CLOSED = "closed",
  NA = "N/A"
}

enum TICKETCATEGORY {
  KYC_AML = "kyc_aml",
  PROFILE = "profile",
  ACCOUNT = "account",
  EXCHANGE = "exchange",
  LAUNCHPAD = "launchpad",
  FARMING = "farming",
  SECURITY = "security",
  PROMOTION = "promotion",
}

@Entity("tickets")
@ObjectType()
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @ManyToOne(() => User, (user: any) => user.tickets)
  @JoinColumn({ name: "user_id" })
  @Field(() => User)
  user: User;

  @Column({ nullable: false })
  user_id: String;

  @Field(() => String)
  @Column({ type: "enum", enum: TICKETCATEGORY, nullable: true })
  category: TICKETCATEGORY;

  @Field(() => String)
  @Column("text", { nullable: true })
  subject: String;

  @Field(() => Boolean)
  @Column("text", { nullable: true })
  files: Boolean;

  @Field(() => String)
  @Column({
    type: "enum",
    enum: TICKETSTATUS,
    default: TICKETSTATUS.OPEN,
    nullable: false,
  })
  ticket_status: TICKETSTATUS;

  @ManyToOne(() => User, (user: any) => user.tickets, { nullable: true })
  @JoinColumn()
  paticipants: User[];

  @ManyToOne(() => Message, (message: any) => message.ticket, {
    onDelete: "CASCADE",
  })
  message: Message;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date();
}
