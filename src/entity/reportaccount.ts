import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

import { User } from "./User";

@Entity("report")
@ObjectType()
export class Report extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid") id: string;

    @ManyToOne(() => User, user => user.reporteduser)
    reporteduser: User;

    @ManyToOne(() => User, user => user.reportedby)
    reportedby: User;
}
