import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { Community } from "./community";
import { User } from "./User";

@Entity("joinCommunityRequest")
@ObjectType()
export class JoinCommunityRequest extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Community)
    @JoinColumn()
    community: Community;

    @ManyToOne(() => User, (user) => user.joinCommunityRequests)
    @Field(() => String)
    user: User;

    @Field(() => String)
    @Column("text", { default: "I would like to join this community" })
    message: string;

    @Field(() => Boolean)
    @Column("boolean", { default: false })
    approved: boolean;
}
