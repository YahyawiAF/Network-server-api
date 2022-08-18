import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { Ticket } from "./Tickets";
import { User } from "./User";

@Entity("message")
@ObjectType()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @ManyToOne(() => Ticket, (ticket: any) => ticket.message, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "ticket_id" })
  ticket: Ticket;

  @Column({ nullable: false })
  ticket_id: String;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  userId: User;

  @Column({ nullable: false })
  user_id: String;

  @OneToMany(() => User, (user) => user.id, { nullable: true })
  @JoinColumn()
  taggeduser: User[];

  @Field(() => String)
  @Column("text")
  message_text: String;

  @Field(() => String)
  @Column("text", { nullable: true })
  attachments: String[];

  @Field(() => String)
  @Column("text", { nullable: true })
  quotted_message_id: String[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date();
}
