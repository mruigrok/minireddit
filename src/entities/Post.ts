import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

/**
 * Post ObjectType and Entity for use in DB
 */
@ObjectType()
@Entity()
export class Post {
	@Field(() => Int)
	@PrimaryKey()
	id!: number;

	@Field(() => String)
	@Property({ type: 'date' })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: 'date', onUpdate: () => new Date() })
	updatedAt = new Date();

	@Field()
	@Property({ type: 'text' })
  title!: string;
};