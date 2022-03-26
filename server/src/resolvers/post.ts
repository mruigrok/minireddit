import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg,
  Query, 
  Resolver, 
  Mutation, 
  InputType, 
  Field, 
  Ctx, 
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts!: Post[]
  @Field()
  hasMore!: boolean
}
/**
 * Post Resolver class
 */
@Resolver(Post)
export class PostResolver {
  /**
   * Returns all posts.
   */
  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];
    if (cursor){
      replacements.push(new Date(parseInt(cursor)))
    }

    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
        ) creator
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    );

    console.log(posts);
    return { 
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    }
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

  @FieldResolver(() => String)
  textSnippet(
    @Root() root: Post,
  ) {
    // Only load a snippet of the text
    return root.text.slice(0, 100);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue =  isUpdoot ? 1 : -1
    const { userId } = req.session;
    await getConnection().query(
      `
      START TRANSACTION;
      
      insert into updoot("userId", "postId", value)
      values (${userId}, ${postId}, ${realValue});
      
      update post
      set points = points + ${realValue}
      where id = ${[postId]};
      
      COMMIT;
      `
    );
    return true;
  }
}