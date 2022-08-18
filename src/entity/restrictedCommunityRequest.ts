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

@Entity("restrictedCommunitiesRequest")
@ObjectType()
export class RestrictedCommunitiesRequest extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Community)
    @JoinColumn()
    community: Community;

    @ManyToOne(() => User, (user) => user.joinCommunityRequests)
    @Field(() => String)
    user: User;

    @Field(() => Boolean)
    @Column("boolean", { default: false })
    approved: boolean;
}
