import argon2 from 'argon2';
import { 
  COOKIE_NAME, 
  COOKIE_OPTIONS, 
  FORGET_PASSWORD_PREFIX, 
  FORGET_PASSWORD_LINK_EXPIRY
} from '../constants';
import { 
  Arg, 
  Ctx, 
  Field, 
  FieldResolver, 
  InputType, 
  Mutation, 
  ObjectType, 
  Query, 
  Resolver, 
  Root
} from "type-graphql";
import { User } from '../entities/User';
import { MyContext } from "../types";
import { validateRegister } from '../helpers/validateRegister';
import { v4 } from 'uuid';
import { getConnection } from 'typeorm';

/** Globals */
const EXISTING_USERNAME_ERROR_CODE = "23505";

/**
 * Username and password used for signing up or logging in
 */
@InputType()
export class UsernamePasswordInput {
  @Field()
  username!: string;
  @Field()
  password!: string;
  @Field()
  email!: string;
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
@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email;
    }

    return "";
  }
  /**
   * Return the userId from the current session
   */
  @Query(() => User,  { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if(!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  };

  /**
   * Create a user if the username and password are valid
   */
  @Mutation(() => UserResponseObject)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponseObject> {
    const errors = validateRegister(options);
    if (errors.length > 0) return { errors };

    /** No issues with user inputs, try to register */
    const hashedPassword =  await argon2.hash(options.password);
    const userOptions = {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    };
    let user;
    try {
      // user = await User.create(userOptions).save();
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(userOptions)
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
        if (
          err.code === EXISTING_USERNAME_ERROR_CODE || 
          err.detail.includes("already exists")
        ) {
          errors.push({
            field: "username",
            message: "username or email is already taken"
          });
        }
        errors.push({
          field: 'db insert',
          message: err.message,
        })
    }

    if (errors.length > 0 || !user) {
      return { errors }
    } else {
      req.session.userId = user.id;
      return { user }
    }
  };

  /**
   * Login to the server with the given username and password
   */
  @Mutation(() => UserResponseObject)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ):Promise<UserResponseObject> {
    const user = await User.findOne(
      usernameOrEmail.includes('@') ?
      { where: { email: usernameOrEmail } } :
      { where: { username: usernameOrEmail } }
    )
    if(!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "user does not exist"
          }
        ]
      };
    }
    const valid = await argon2.verify(user.password, password);
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

  /**
   * Logout by clearing the cookie and destroying the current session
   */
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
        if (err) {
          console.log(err);
          resolve(false)
          return
        }
        resolve(true)
      })
    })
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email }});
    if (!user) {
      // the email is not in the db
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token, 
      user.id, 
      'ex',
      FORGET_PASSWORD_LINK_EXPIRY
    );
    // await sendEmail(email,
    //   `<a href="http:localhost:3000/change-password/${token}> Reset Password </a>`);
    // Grab since the emal link doesn't work currently
    console.log(token, user.id);
    return true;
  }

  @Mutation(() => UserResponseObject)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { req, redis }: MyContext
  ) {
    const errors = [];
    if (newPassword.length < 5) {
      errors.push(
        {
          field: "newPassword",
          message: "length must be greater than 5"
        }
      );
      return { errors } 
    }
    const changePasswordKey = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(changePasswordKey);
    if (!userId) {
      errors.push(
        {
          field: "token",
          message: "token expired"
        }
      );
      return { errors }
    }
    const parsedUserId= parseInt(userId); 
    const user = await User.findOne(parsedUserId);
    if (!user) {
      errors.push(
        {
          field: "token",
          message: "user no longer exists"
        }
      );
      return { errors }
    }

    await User.update(
      { id: parsedUserId }, 
      { password: await argon2.hash(newPassword)},
    );
    await redis.del(changePasswordKey);

    /** Log in after password change */
    req.session.userId = user.id;
    return { user };
  }
};