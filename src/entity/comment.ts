import { IsNotEmpty } from "class-validator";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";
import { Reaction } from "./Reaction";

@ObjectType()
@Entity("comments")
export class Comment extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @Column()
  @IsNotEmpty()
  public text: string;

  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
    onDelete: "CASCADE",
  })
  public user: User;

  @ManyToOne(() => Post, (post) => post.comments, {
    eager: true,
    onDelete: "CASCADE",
  })
  public post: Post;

  @OneToMany(() => Reaction, (reaction) => reaction.comment, {
    eager: true,
    onDelete: "CASCADE",
  })
  public reaction: Reaction;

  @Field(() => Date)
  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Field(() => Date)
  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}
