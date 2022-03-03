import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';

interface RegisterProps {

}

export const Register: React.FC<RegisterProps> = ({}): JSX.Element => {
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: "", password: ""}}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='username'
              placeholder='username'
              label='Username'
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
            <Button
             mt={4}
             type="submit"
             isLoading={isSubmitting}
             color='blue'
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;