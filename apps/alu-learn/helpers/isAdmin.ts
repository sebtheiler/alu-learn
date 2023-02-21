import { Context } from "graphql/context";
import getUserGQL from "helpers/getUserGQL";

/**
 * Is the current user an admin?
 * @param ctx Nexus/GraphQL context
 * @returns Whether or not the current user is an admin (also returns true if in development)
 */
const isAdmin = async (ctx: Context): Promise<boolean> => {
  if (process.env.NODE_ENV === "development") return true;
  const user = await getUserGQL(ctx);
  return user?.role === "ADMIN";
};
export default isAdmin;
