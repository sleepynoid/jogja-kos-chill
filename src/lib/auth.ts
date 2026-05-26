// Re-export server functions for use in components
export {
  getCurrentUser,
  loginFn,
  registerFn,
  userLoginFn,
  userRegisterFn,
  logoutFn,
} from "./auth.server";
export type { SessionUser } from "./session";
