import * as bcrypt from "bcryptjs";
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { KYC } from "./KYC";
import { Ticket } from "./Tickets";
import { Post } from "./Post";
import { Comment } from "./comment";
import { Share } from "./Share";
import { Event } from "./Event"
import { Follower } from "./followers";
import { Block } from "./block";
import { Report } from "./reportaccount";
import { ProfileViews } from "./profileView";
import { Experience } from "./experience";
import { Community } from "./community";
import { JoinCommunityRequest } from "./joinCommunityRequests";

enum userType {
  Admin = "admin",
  business = "business",
  support = "support",
  Kycteam = "Kyc",
  individual = "individual",
}
enum accountStatus {
  Disabled = "disabled",
  Enable = "enable",
}

enum onboardingStatus {
  incomplete = "incomplete",
  completed = "completed",
}

@Entity("users")
@Unique(["email", "userName"])
@ObjectType()
export class User extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @Column("varchar", { unique: true, length: 255 })
  email: string;

  @Field()
  @Column("varchar", { length: 255 })
  firstName: string;

  @Field()
  @Column("varchar", { length: 255 })
  lastName: string;

  @Field()
  @Column("varchar", { length: 255, nullable: true })
  fullName: string;

  @Field()
  @Column("varchar", { nullable: true, length: 255 })
  middleName: string;

  @Field(() => String, { nullable: true })
  @Column("varchar", { unique: true, nullable: true, length: 255 })
  userName: string;

  @Column("text")
  password: string;

  @Field(() => String)
  @Column("boolean", { default: false })
  confirmed: boolean;

  @Column("text", { nullable: true })
  country: string;

  @Field(() => String)
  @Column("text", { nullable: true })
  phoneNumber: String;

  @Field(() => String)
  @Column({
    type: "enum",
    enum: userType,
    default: userType.individual,
    nullable: true,
  })
  userType: userType;

  @Field(() => String)
  @Column({ type: "date", nullable: true })
  dateOfBirth: Date;

  @Field(() => String)
  @Column("text", { nullable: true })
  address1: String;

  @Field(() => String)
  @Column("text", { nullable: true })
  address2: String;

  @Field(() => String)
  @Column("text", { nullable: true })
  city: String;

  @Field(() => String)
  @Column("text", { nullable: true })
  postalCode: String;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  profileImage?: String;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @Column("text", { nullable: true })
  forgotPasswordToken: String;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date();

  @OneToMany(() => KYC, (Kyc: any) => Kyc.user)
  kyc: KYC;

  @OneToMany(() => Ticket, (tickets: any) => tickets.user, {
    cascade: true,
  })
  @Field(() => [Ticket])
  tickets: Ticket[];

  @OneToMany(() => Ticket, (ticket: any) => ticket.participants, {
    nullable: true,
  })
  paticipants: Ticket;

  @Field(() => String)
  @Column({
    type: "enum",
    enum: accountStatus,
    default: accountStatus.Disabled,
  })
  account_status: accountStatus;

  @Field(() => String)
  @Column({
    type: "enum",
    enum: onboardingStatus,
    default: onboardingStatus.incomplete,
  })
  onBoarding: onboardingStatus;

  @Field(() => String)
  @Column("text", { nullable: true })
  website: string;

  @OneToMany(() => Post, (post) => post.user, {
    cascade: true,
    nullable: true,
  })
  @Field(() => [Post])
  public posts: Post[];

  @OneToMany(() => Event, (event) => event.orginazer, {
    cascade: true,
    nullable: true,
  })
  @Field(() => [Event])
  public events: Event[];

  @OneToMany(() => Comment, (comment) => comment.user)
  public comments: Comment[];

  @OneToMany(() => Share, (share) => share.user)
  public shares: Share[];

  @OneToMany(() => Follower, follower => follower.follower)
  public follower: Follower[];

  @OneToMany(() => Follower, follower => follower.following)
  public following: Follower[];

  @OneToMany(() => Block, block => block.blocked_user)
  public blocked_user: Block[];

  @OneToMany(() => Block, block => block.blockedby)
  public blockedby: Block[];

  @OneToMany(() => Report, report => report.reporteduser)
  public reporteduser: Report[];

  @OneToMany(() => Report, report => report.reportedby)
  public reportedby: Report[];

  @OneToMany(() => ProfileViews, profileViews => profileViews.viewed_by)
  public viewed_by: ProfileViews[];

  @OneToMany(() => ProfileViews, profileViews => profileViews.viewed_profile)
  public viewed_profile: ProfileViews[];

  @OneToMany(() => Experience, (experience) => experience.user, {
    cascade: true,
    nullable: true,
  })
  @Field(() => [Experience])
  public experience: Experience[];

  @OneToMany(() => Community, (community) => community.communityAdmin, {
    cascade: true,
    nullable: true,
  })
  @Field(() => [Community])
  public communities: Community[];


  @OneToMany(() => JoinCommunityRequest, (communityjoinrequests) => communityjoinrequests.user, {
    cascade: true,
    nullable: true,
    onDelete: "CASCADE"
  })
  @Field(() => [JoinCommunityRequest])
  public joinCommunityRequests: JoinCommunityRequest[];

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
