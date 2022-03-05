import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg,
  Query, 
  Resolver, 
  Mutation, 
  InputType, 
  Field, 
  Ctx, 
  UseMiddleware
} from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string
}

/**
 * Post Resolver class
 */
@Resolver()
export class PostResolver {
  /**
   * Returns all posts.
   */
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    // DEBUG: Showing the difference in server side rendering
    // await sleep(3000);
    return Post.find();
  };

  /**
   * Return a specific post
   */
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  };
  
  /**
   * Create a new post and return
   */
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ 
      ...options,
      creatorId: req.session.userId,
    }).save();
  };

  /**
   * Update an existing post and return it
   */
  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title",  () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if(!post) {
      return null;
    }
    if(typeof title !== 'undefined') {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  };

  /**
   * Delete a post
   */
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  };
}