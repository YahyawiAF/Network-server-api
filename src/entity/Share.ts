import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
@ObjectType()
export class Share extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn()
  id: String;

  @OneToOne(() => Post)
  @JoinColumn()
  post: Post;

  @ManyToOne(() => User, (user) => user.shares, {
    eager: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  public user: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date();
}
