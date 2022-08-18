import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class responseType {
    @Field(() => [String], { nullable: true })
    suggestion?: string[];

    @Field(() => String, { nullable: true })
    message?: string;

    @Field(() => Boolean)
    success?: boolean;
}