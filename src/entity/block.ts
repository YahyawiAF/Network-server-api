import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { User } from "./User";

@Entity("block")
@ObjectType()
export class Block extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid") id: string;

    @ManyToOne(() => User, user => user.blocked_user)
    blocked_user: User;

    @ManyToOne(() => User, user => user.blockedby)
    blockedby: User;
}
