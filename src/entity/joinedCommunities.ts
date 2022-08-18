import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from "typeorm";
import { Field, ObjectType, registerEnumType } from "type-graphql";

import { Community } from "./community";
import { User } from "./User";
import { IsEnum } from "class-validator";

enum REQUESTSTATUS {
    approved = "approved",
    pending = "pending",
    rejected = "rejected",
}

registerEnumType(REQUESTSTATUS, {
    name: "RequestStatus", // this one is mandatory
    description: "Status of Request", // this one is optional
});

@Entity("joinedCommunties")
@ObjectType()
export class JoinedCommunties extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Community, (community) => community.joinedUsers)
    @Field(() => Community)
    public community: Community;

    @ManyToOne(() => User, (user) => user.joinCommunityRequests)
    @Field(() => User)
    public user: User;

    @Field(() => String)
    communityType: string;

    @Field(() => REQUESTSTATUS)
    @IsEnum(REQUESTSTATUS)
    @Column({
        type: "enum",
        enum: REQUESTSTATUS,
        default: REQUESTSTATUS.pending
    })
    requestStatus: REQUESTSTATUS;
}
