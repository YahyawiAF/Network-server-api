import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
} from "typeorm";

@Entity()
@ObjectType()
export class Localization extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn()
  id: String;

  @Field(() => String)
  @Column()
  adress: string;

  @Field(() => String)
  @Column()
  venue: string;

  @Field(() => String)
  @Column()
  registration: string;

}