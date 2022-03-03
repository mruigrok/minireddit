import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

interface NavBarProps {};

export const NavBar: React.FC<NavBarProps> = ({}): JSX.Element => {
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    // User not logged in
    body = (
      <>
        <NextLink href={'login'}>
          <Link mr={2}> Login </Link>
        </NextLink>
        <NextLink href={'register'}>
          <Link> Register </Link>
        </NextLink>
      </>
    );
  } else {
    // User logged in
    body = (
      <Flex>
        <Box mr={2}> {data.me.username} </Box>
        <Button 
          onClick={() => logout()}
          variant='link'
          isLoading={ logoutFetching }
        > 
          Logout 
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg='#6b5b95' p={4}>
      <Box ml={'auto'}>
        { body }
      </Box>
    </Flex>
  );
};