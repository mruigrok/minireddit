import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column, 
  CreateDateColumn,
  Entity, 
  ManyToOne, 
  OneToMany, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm";
import { Updoot } from "./Updoot";
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
  @Column({ type: "int", default: 0})
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus!: number | null;

  @Field(() => Int)
  @Column()
  creatorId!: number;

  @Field()
  @ManyToOne(() => User, user => user.posts)
  creator!: User;

  @OneToMany(() => Updoot, updoot => updoot.user)
  updoots!: Updoot[];

	@Field(() => String)
	@CreateDateColumn()
	createdAt!: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt!: Date;
};