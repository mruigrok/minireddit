import { UsernamePasswordInput } from "../resolvers/user";

export const validateRegister = (options: UsernamePasswordInput) => {
  const errors = [];
  if (!options.email.includes('@')) {
    errors.push({
      field: "email",
      message: "incorrect format"
    });
  }
  if (options.username.includes('@')) {
    errors.push({
      field: "username",
      message: "cannot include '@' in username"
    });
  }
  if (options.username.length <= 4) {
    errors.push({
      field: "username",
      message: "length must be greater than 5"
    });
  }
  if (options.password.length <= 4) {
    errors.push({
      field: "password",
      message: "length must be greater than 5"
    });
  }
  return errors;
}