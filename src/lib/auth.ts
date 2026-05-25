// Re-export server functions for use in components
export { getCurrentUser, loginFn, registerFn, logoutFn } from "./auth.server";
export type { SessionUser } from "./session";
