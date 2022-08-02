import type { Context } from "../graphql/context";
import type { User } from "@prisma/client";

/**
 * Get the current user
 * @param ctx GraphQL/Nexus context
 * @returns The current user or null
 */
const getUser = async (ctx: Context): Promise<User | null> => {
  if (process.env.NODE_ENV === "development" && !ctx.user) {
    return ctx.prisma.user.findFirst();
  }

  return await ctx.prisma.user.findUnique({
    where: {
      email: ctx.user?.email ?? "",
    },
  });
};

export default getUser;
