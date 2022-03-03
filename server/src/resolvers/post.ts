import { sleep } from "../helpers/sleep";
import { Arg, Ctx, Query, Resolver, Mutation, Int } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";

/**
 * Post Resolver class
 */
@Resolver()
export class PostResolver {
  /**
   * Returns all posts.
   */
  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    // DEBUG: Showing the difference in server side rendering
    await sleep(3000);
    return em.find(Post, {});
  };

  /**
   * Return a specific post
   */
  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int ) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  };
  
  /**
   * Create a new post and return
   */
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = em.create(Post, {
      title,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await em.persistAndFlush(post);
    return post;
  };

  /**
   * Update an existing post and return it
   */
  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title",  () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if(!post) {
      return null;
    }
    if(typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  };
  /**
   * Delete a post
   */
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  };
}