import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";
import { Comment } from "./comment";

enum REACTION {
  LIKE = "like",
  HEART = "heart",
  GIFT = "gift",
  CLAP = "clap",
  BRILLIAN = "brilliant",
  WOW = "wow",
  DESLIKE = "deslike",
}

@Entity()
@ObjectType()
export class Reaction extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn()
  id: String;

  @ManyToOne(() => Post, (post) => post.reaction, {
    eager: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  post: Post;

  @ManyToOne(() => User, (user) => user.shares, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  public user: User;

  @ManyToOne(() => Comment, (comment) => comment.reaction, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  comment: Comment;

  @Field(() => String)
  @Column({ type: "enum", enum: REACTION, nullable: true })
  reaction: REACTION;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date();
}
