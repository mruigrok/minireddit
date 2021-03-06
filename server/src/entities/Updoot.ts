import { ObjectType } from "type-graphql";
import {
  BaseEntity, 
  Column, 
  Entity, 
  ManyToOne, 
  PrimaryColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

/**
 * Post ObjectType and Entity for use in DB
 */
@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Column({ type: "int"})
  value!: number

	@PrimaryColumn()
	userId!: number;

  @ManyToOne(() => User, user => user.updoots)
  user!: User;

  @PrimaryColumn()
  postId!: number;

  @ManyToOne(() => Post, post => post.updoots)
  post!: Post;
};