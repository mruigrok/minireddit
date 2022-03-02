import argon2 from 'argon2';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from '../entities/User';
import { MyContext } from "../types";

/** Globals */
const EXISTING_USERNAME_ERROR_CODE = "23505";

/**
 * Username and password used for signing up or logging in
 */
@InputType()
class UsernamePasswordInput {
  @Field()
  username!: string;
  @Field()
  password!: string
}

/**
 * Error message object to return
 */
@ObjectType()
class FieldError {
  @Field()
  field!: string;

  @Field()
  message!: string;
}

/**
 * Return Object for different mutation functions
 */
@ObjectType()
class UserResponseObject {
  @Field(() => [FieldError],  { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable:true })
  user?: User
}

/**
 * User Resolver class
 */
@Resolver()
export class UserResolver {
  /**
   * Return the userId from the current session
   */
  @Query(() => User,  { nullable: true })
  async me(
    @Ctx() { em, req }: MyContext
  ) {
    if(!req.session.userId) {
      return null;
    }
    return em.findOne(User, { id: req.session.userId });
  };

  /**
   * Create a user if the username and password are valid
   */
  @Mutation(() => UserResponseObject)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponseObject> {
    const errors = [];
    if (options.username.length <= 4) {
      errors.push({
        field: "username",
        message: "length must be greater than 5"
      });
    }
    if (options.password.length <= 4) {
      errors.push({
        field: "password",
        message: "length must be greater than 5"
      });
    }
    if (errors.length > 0) {
      return { errors };
    }

    const hashedPassword =  await argon2.hash(options.password);
    const userOptions: any = {
      username: options.username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const user = em.create(User, userOptions);
    await em.persistAndFlush(user).catch((err) => {
      if (err.code === EXISTING_USERNAME_ERROR_CODE) {
        errors.push({
          field: "username",
          message: "username is already taken"
        });
      }
    });

    if (errors.length > 0) {
      return { errors }
    } else {
      return { user }
    }
  };

  /**
   * Login to the server with the given username and password
   */
  @Mutation(() => UserResponseObject)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ):Promise<UserResponseObject> {
    const user = await em.findOne(User, { username: options.username });
    if(!user) {
      return {
        errors: [
          {
            field: "username",
            message: "user does not exist"
          }
        ]
      };
    }
    const valid = await argon2.verify(await user.password, options.password);
    if(!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password"
          }
        ]
      };
    }
    req.session.userId = user.id;
    return { user };
  };
};