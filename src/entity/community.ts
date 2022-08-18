import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    Unique,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { User } from "./User";

import { registerEnumType } from "type-graphql";
import { RestrictedCommunitiesRequest } from "./restrictedCommunityRequest";
import { IsEnum } from "class-validator";
import { JoinedCommunties } from "./joinedCommunities";

enum COMMUNITYTYPE {
    public = "public",
    private = "private",
    restricted = "restricted",
}

registerEnumType(COMMUNITYTYPE, {
    name: "CommunityType", // this one is mandatory
    description: "Type of Community", // this one is optional
});


@Entity("communities")
@Unique(["communityName"])
@ObjectType()
export class Community extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, (user) => user.communities, {
        nullable: false,
        onDelete: "CASCADE",
    })
    public communityAdmin: User;

    @OneToMany(() => JoinedCommunties, (joinedCommunities) => joinedCommunities.community)
    @Field(() => [JoinedCommunties])
    public joinedUsers: JoinedCommunties[]

    @Field(() => String)
    @Column("varchar", { unique: true, length: 255 })
    communityName: string;

    @Field(() => String)
    @Column("varchar", { unique: true, length: 255 })
    communityHolder: string;

    @Field(() => String, { nullable: true })
    @Column("text", { nullable: true })
    communityDescription: string;

    @Field(() => COMMUNITYTYPE)
    @IsEnum(COMMUNITYTYPE)
    @Column({
        type: "enum",
        enum: COMMUNITYTYPE,
        default: COMMUNITYTYPE.public,
    })
    communityType: COMMUNITYTYPE;

    @Field(() => Boolean)
    @Column("boolean", { default: false })
    adult_community: boolean;

    @OneToMany(() => RestrictedCommunitiesRequest, (community) => community.community, {
        cascade: true,
        nullable: true,
        onDelete: "CASCADE"
    })
    @Field(() => [RestrictedCommunitiesRequest])
    public restrictedCommunitiesRequests: RestrictedCommunitiesRequest[];

}
