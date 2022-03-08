import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from 'next/link';
import Layout from '../components/Layout';
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

// Server-side render content that can be searchable or appear in a google search
// Or dynamic data
// Pages like the login and register are static and can be client-side rendered
const Index = () => {
  const [{ data, fetching }] = usePostsQuery({ 
    variables: {
      limit: 10
    }
  });

  if (!fetching && !data) {
    return <div> Something is bad</div>
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
        <Stack spacing={6}>
          { data.posts.map((p) => (
            <Box key={p.id} p={5} shadow='md' borderWidth="1px">
              <Heading fontSize='xl'> { p.title } </Heading>
              <Text mt={4}> { p.textSnippet} </Text>
            </Box>
          ))}
        </Stack> 
        )
      }
      { data ? (
        <Flex >
          <Button m='auto' my={4}> Load More </Button>
        </Flex>
        ) : null
      }
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient,  { ssr: true })(Index);
