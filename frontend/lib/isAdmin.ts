import { Context } from "../graphql/context";
import getUser from "./getUser";

/**
 * Is the current user an admin?
 * @param ctx Nexus/GraphQL context
 * @returns Whether or not the current user is an admin (also returns true if in development)
 */
const isAdmin = async (ctx: Context): Promise<boolean> => {
  if (process.env.NODE_ENV === "development") return true;
  const user = await getUser(ctx);
  return user?.role === "ADMIN";
};
export default isAdmin;
