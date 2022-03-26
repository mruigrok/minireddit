import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
  post: PostSnippetFragment
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }): JSX.Element => {
  const [loading, setLoading] = 
    useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
  const [, vote] = useVoteMutation();
  return (
    <>
      <Flex 
      direction="column" 
      justifyContent="center"
      alignItems="center"
      mr={4}
      >
        <IconButton 
          aria-label={"updoot post"}
          onClick={async () => {
            setLoading('updoot-loading');
            await vote({
              postId: post.id,
              value: 1
            });
            setLoading('not-loading');
          }}
          isLoading={loading === 'updoot-loading'}
          icon={<ChevronUpIcon color={
            post.voteStatus === 1 ? "green" : undefined
          }/>}
        />
        {post.points}
        <IconButton 
          aria-label={"downdoot post"}
          onClick={async() => {
            setLoading('downdoot-loading');
            await vote({
              postId: post.id,
              value: -1
            });
            setLoading('not-loading');
          }}
          isLoading={loading === 'downdoot-loading'}
          icon={<ChevronDownIcon color={
            post.voteStatus === -1 ? "tomato" : undefined
          }/>}
        />
      </Flex>
    </>
  );
}