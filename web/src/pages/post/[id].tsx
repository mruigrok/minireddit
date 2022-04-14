import React from 'react';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { usePostQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';

export const Post: React.FC<{}> = ({}): JSX.Element => {
  const router = useRouter();
  const postId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1
  const [{ data, error, fetching }] = usePostQuery({
    pause: postId === -1,
    variables: {
      id: postId
    }
  });

  if (fetching) {
    return (
      <Layout>
        <div> Loading... </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div> Error... </div>
      </Layout>
    )
  }

  return <Layout>{ data?.post?.text }</Layout>
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);