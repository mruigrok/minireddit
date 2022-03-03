import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

/**
 * User ObjectType and Entity for use in DB
 */
@ObjectType()
@Entity()
export class User {
	@Field(() => Int)
	@PrimaryKey()
	id!: number;

  @Field(() => String)
	@Property({ type: 'text', unique: true })
	username!: string;

  @Field(() => String)
	@Property({ type: 'text'})
	password!: string;

	@Field(() => String)
	@Property({ type: 'date' })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: 'date', onUpdate: () => new Date() })
	updatedAt = new Date();

};