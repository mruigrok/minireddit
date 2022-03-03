require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import mikroOrmConfig from './mikro-orm.config';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { COOKIE_NAME, __prod__ } from './constants';
import { MyContext } from './types';
import cors from 'cors';

/** Declaration merging */
declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const RedisStore = require("connect-redis")(session);
  const redisClient = new Redis(process.env.REDIS_URL);

  const app = express();
  app.set('trust proxy', process.env.NODE_ENV !== 'production');
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://studio.apollographql.com"
      ],
      credentials: true,
    })
  );

  /** Must be done before adding the apollo middleware as ordering matters */
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'none', // Protecting against csrf
        //sameSite: 'lax', // Protecting against csrf, doesnt' set cookie
        secure: true,
      },
      saveUninitialized: false,
      secret: "hello" || process.env.REDIS_SESSION_SECRET,
      resave: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        HelloResolver,
        PostResolver,
        UserResolver
      ],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ 
      em: orm.em, 
      req, 
      res
    })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ 
    app,
    cors: false
  });

  app.get('/',  (_, res) => {
    res.send('Hello');
  });
  app.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
  });

};

main().catch((err) => {
  console.log(err);
});


