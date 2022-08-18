import { IsNotEmpty } from "class-validator";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Photo } from "./Photo";
import { User } from "./User";
import { Localization } from "./Localization";

@Entity("posts")
@ObjectType()
export class Event extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @Column()
  @IsNotEmpty()
  public title: string;

  @Field(() => String)
  @Column()
  public description: string;

  @Field(() => String)
  @Column()
  public experience_level: string;

  @Field(() => Number)
  @Column()
  public people_invole_planning: Number;

  @OneToOne(() => User)
  @JoinColumn()
  public speaker: User[];

  @Field(() => String)
  @Column()
  public event_host_plan: string;

  @Field(() => String)
  @Column()
  public event_type: string;

  @Field(() => String)
  @Column()
  public event_category: string;

  @OneToOne(() => Photo)
  @JoinColumn()
  photos: Photo;

  @OneToOne(() => Localization)
  @JoinColumn()
  localization: Localization;

  @Field(() => Date)
  @Column()
  public event_start_date: Date;

  @Field(() => Date)
  @Column()
  public event_end_date: Date;

  @ManyToOne(() => User, (user) => user.events, {
    eager: true,
    onDelete: "CASCADE",
  })
  public orginazer: User;

  @Field(() => Date)
  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Field(() => Date)
  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}
