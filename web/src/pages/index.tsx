import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from 'next/link';
import { useState } from "react";
import Layout from '../components/Layout';
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

// Server-side render content that can be searchable or appear in a google search
// Or dynamic data
// Pages like the login and register are static and can be client-side rendered
const Index = () => {
  const [variables, setVariables] = useState({ 
    limit: 10, 
    cursor: null as null | string
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  if (!fetching && !data) {
    return <div> Something is bad </div>
  }

  return (
    <Layout>
      <Flex align='center'>
        <Heading>MiniReddit</Heading>
        <NextLink href={'/create-post'}>
          <Link ml='auto'>
            create post
          </Link>
        </NextLink>
      </Flex>
      <br/>
      { !data ? (
        <div> Loading yo... </div>
      ) : (
        <Stack spacing={8}>
          { data.posts.posts.map((p) => (
            <Flex key={p.id} p={5} shadow="md" borderWidth={"1px"} >
              <UpdootSection post={p}/>
              <Box>
                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize='xl'> { p.title } </Heading>
                  </Link>
                </NextLink>
                <Text> Posted by: { p.creator.username } </Text>
                <Text mt={4}> { p.textSnippet} </Text>
              </Box>
            </Flex>
          ))}
        </Stack> 
        )
      }
      { data && data.posts.hasMore ? (
        <Flex >
          <Button onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
            })
          }}m='auto' my={4}> Load More </Button>
        </Flex>
        ) : null
      }
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient,  { ssr: true })(Index);
