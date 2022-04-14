import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { 
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation, 
  VoteMutationVariables
} from "../generated/graphql";
import { betterUpdateQuery } from '../utils/betterUpdateQuery';
import  Router from "next/router";
import { pipe, tap } from 'wonka';
import gql from 'graphql-tag';
import { isServer } from "./isServer";

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    
    const results: string[] = [];
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolve({ __typename: 'Query' }, fieldKey) as string,
      "posts"
    );

    info.partial = !isItInTheCache;
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      const key = cache.resolve({ __typename: 'Query' }, fi.fieldKey) as string;
      const data = cache.resolve(key, fi.fieldName) as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results
    };
  }; 
};

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

export const  createUrqlClient = ((ssrExchange: any, ctx: any) => {
  let cookie = "";
  if(isServer()) {
    cookie = ctx.req.headers.cookie;
  }
  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: "include",
      headers: { 
        "x-forwarded-proto": "https",
        "cookie": cookie,
      },
    } as const,
    exchanges: [
      dedupExchange, 
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            vote: (_result, args, cache, info) => {
              const { postId, value} = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }
                const newPoints = data.points +  value;
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      id
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value } as any
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
              fieldInfos.forEach(fi => {
                cache.invalidate('Query', 'posts', fi.arguments || {})
              });
            },
            logout:(_result, args, cache, info) => {
              // Me query needs null
              betterUpdateQuery<LoginMutation, MeQuery> (
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null})
              )
            },
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery> (
                cache, 
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query
                  } else {
                    return {
                      me: result.login.user
                    };
                  }
                }
              );
            },
            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery> (
                cache, 
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query
                  } else {
                    return {
                      me: result.register.user
                    };
                  }
                }
              );
            },
          }
        }
      }),
      errorExchange,
      ssrExchange,
      fetchExchange
    ],
  }
});