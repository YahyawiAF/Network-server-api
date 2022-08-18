import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Post } from "./Post";

@Entity()
@ObjectType()
export class Photo extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn()
  id: String;

  @Field(() => String)
  @Column()
  url: string;

  @ManyToOne(() => Post, (post) => post.photos)
  post: Post;
}
