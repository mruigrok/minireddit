export const __prod__ = process.env.NODE_ENV === "production";
export const COOKIE_NAME = 'qid';
export const COOKIE_OPTIONS = {
  domain: 'localhost',
  path: '/'
};
export const FORGET_PASSWORD_PREFIX = 'forget-password';
export const FORGET_PASSWORD_LINK_EXPIRY = 1000 * 60 * 60 * 24 * 3; // 3 days