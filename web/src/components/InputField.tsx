import React, { InputHTMLAttributes } from 'react';
import { useField } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  placeholder: string;
  name: string;
  textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  textarea,
  size: _,
  ...props 
}): JSX.Element => {
  let InputOrTextarea = Input;
  if (textarea) {
    InputOrTextarea = Textarea as any;
  }
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={ !!error }>
      <FormLabel htmlFor={ field.name }>{ label }</FormLabel>
      <InputOrTextarea {...field} {...props} id={ field.name } />
      { error ? <FormErrorMessage>{ error }</FormErrorMessage>: null }
  </FormControl>
  );
}