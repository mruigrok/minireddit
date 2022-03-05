//import { Entity, PrimaryKey, Column } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column,
  CreateDateColumn,
  Entity, 
  OneToMany, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm";
import { Post } from "./Post";

/**
 * User ObjectType and Entity for use in DB
 */
@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

  @Field(() => String)
	@Column({unique: true })
	username!: string;

  @Field(() => String)
	@Column({ unique: true })
	email!: string;

  @Field(() => String)
	@Column()
	password!: string;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[] | undefined;

	@Field(() => String)
	@CreateDateColumn()
	createdAt!: Date;

	@Field(() => String)
  @UpdateDateColumn()
  updatedAt!: Date;

};