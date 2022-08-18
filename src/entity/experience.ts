import { IsNotEmpty } from "class-validator";
import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("experience")
@ObjectType()
export class Experience extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Field(() => String)
    @Column()
    @IsNotEmpty()
    public title: string;

    @Field(() => String)
    @Column()
    @IsNotEmpty()
    public company: string;

    @Field(() => String)
    @Column()
    @IsNotEmpty()
    public headline: string;

    @Field(() => String)
    @Column()
    public location: string;

    @ManyToOne(() => User, (user) => user.experience, {
        eager: true,
        onDelete: "CASCADE",
    })
    public user: User;

    @Field(() => Boolean)
    @Column("boolean", { default: false })
    public currently_working: boolean;

    @Field(() => String)
    @Column("text", { nullable: true })
    public description: string;

    @Field(() => String)
    @Column("text", { nullable: true })
    public employment_type: string;

    @Field(() => Date)
    @Column()
    @CreateDateColumn()
    public createdAt: Date;

    @Field(() => Date)
    @Column()
    @UpdateDateColumn()
    public updatedAt: Date;
}
