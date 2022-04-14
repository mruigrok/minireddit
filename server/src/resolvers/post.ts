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
import { Updoot } from "../entities/Updoot";

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
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const { userId } =  req.session;
    const replacements: any[] = [realLimitPlusOne];
    let cursorIndex = 3;
    if (cursor){
      replacements.push(new Date(parseInt(cursor)))
      cursorIndex = replacements.length;
    }
    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
        ) creator,
      ${
        !!userId ? 
        `(select value from updoot where "userId" = ${userId} and "postId" = p.id) "voteStatus"` : 
        'null as "voteStatus"'
      }
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    );

    // console.log(posts);
    return { 
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    }
  };

  /**
   * Return a specific post
   */
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["creator"] });
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
    console.log(req.session)
    const updoot = await Updoot.findOne({ where: { postId, userId } });

    if ( updoot && updoot.value !== realValue ) {
      // Voted and are changing
      await getConnection().transaction(async tm => {
        await tm.query(
          `
          update updoot
          set value = $1
          where "postId" = $2 and "userId" = $3
          `, 
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
          `, 
          [realValue * 2, postId]
        );
      })
    } else if (!updoot) {
      // Never voted before
      await getConnection().transaction(async tm => {
        await tm.query(
          `
          insert into updoot("userId", "postId", value)
          values ($1, $2, $3)
          `, 
          [userId, postId, realValue]
        );
        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
          `, 
          [realValue, postId]
        );
      });
    } else {
      // Doot ing something that has been dooted already
    }

    return true;
  }
}