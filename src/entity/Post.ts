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
import { Comment } from "./comment";
import { Photo } from "./Photo";
import { User } from "./User";

enum POSTREACTION {
  LIKE = "like",
  HEART = "heart",
  GIFT = "gift",
  CLAP = "clap",
  BRILLIAN = "brilliant",
  WOW = "wow",
  DESLIKE = "deslike",
}

@Entity("posts")
@ObjectType()
export class Post extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @Column()
  @IsNotEmpty()
  public title: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  public url: string;

  @Field(() => String)
  @Column()
  public text: string;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  public user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  public comments: Comment[];

  @OneToMany(() => Photo, (photo) => photo.post)
  photos: Photo[];

  @Field(() => Date)
  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Field(() => String)
  @Column({ type: "enum", enum: POSTREACTION, nullable: true })
  reaction: POSTREACTION;

  @Field(() => Date)
  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}
