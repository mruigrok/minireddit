import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const CreatePost: React.FC<{}> = ({}): JSX.Element => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter()
  const [, createPost] = useCreatePostMutation();

  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login")
    }
  }, [fetching, data, router]);

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: "", text: ""}}
        onSubmit={async (values) => {
          const { error } = await createPost({ options: values });
          if (!error) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name='title'placeholder='title' label='Title' textarea={false} />
            <Box mt={4}>
              <InputField name='text' placeholder='text...' label='Body'  textarea={true}/>
            </Box>
            <Button
             mt={4}
             type="submit"
             isLoading={isSubmitting}
             color='blue'
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(CreatePost);