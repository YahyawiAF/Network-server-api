import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { User } from "./User";

@Entity("profile_view")
@ObjectType()
export class ProfileViews extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid") id: string;

    @ManyToOne(() => User, user => user.viewed_by)
    viewed_by: User;

    @ManyToOne(() => User, user => user.viewed_profile, { cascade: true, onDelete: "CASCADE" })
    viewed_profile: User;
}
