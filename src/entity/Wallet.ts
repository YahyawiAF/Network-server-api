import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
@Entity("Wallet")
@ObjectType()
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @OneToOne(() => User)
  @JoinColumn()
  userId: String;

  @Field(() => String)
  @Column("text")
  sign_message: String;

  @Field(() => String)
  @Column("text")
  wallet_address: String;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date();
}
