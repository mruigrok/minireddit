import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column, 
  CreateDateColumn,
  Entity, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm";
import { User } from "./User";

/**
 * Post ObjectType and Entity for use in DB
 */
@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
  title!: string;

  @Field()
	@Column()
  text!: string;


  @Field(() => Int)
  @Column()
  creatorId!: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0})
  points!: number;

  @ManyToOne(() => User, user => user.posts)
  creator!: User;

	@Field(() => String)
	@CreateDateColumn()
	createdAt!: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt!: Date;
};