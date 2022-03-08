import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { createUrqlClient } from '../utils/createUrqlClient';

export const Login: React.FC<{}> = ({}): JSX.Element => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: "", password: ""}}
        onSubmit={async (values, { setErrors }) => {
          const res = await login(values);
          if (res.data?.login.errors) {
            setErrors(toErrorMap(res.data.login.errors));
          } else if (res.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='usernameOrEmail'
              placeholder='username or email'
              label='Username or Email'        
            >
            </InputField>
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label='Password'
                type='password'           
              >
              </InputField>
            </Box>
            <Flex mt={4} >
              <NextLink href='/forgot-password'>
                <Link ml='auto'> Forgot Password? </Link>
              </NextLink>
            </Flex>
            <Button
             mt={4}
             type="submit"
             isLoading={isSubmitting}
             color='blue'
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Login);