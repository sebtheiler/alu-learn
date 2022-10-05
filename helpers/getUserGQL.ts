import { Prisma, User } from "@prisma/client";
import type { Context } from "graphql/context";

/**
 * Get the current user
 * @param ctx GraphQL/Nexus context
 * @param select Parameters to select from the user. Defaults to just selecting the user's ID. Set equal to `null` to select all
 * @returns The current user or null
 */
const getUserGQL = async (
  ctx: Context,
  select: Prisma.UserSelect | undefined | null = { id: true }
): Promise<Partial<User> | null> => {
  if (process.env.NODE_ENV === "development" && !ctx.user) {
    return ctx.prisma.user.findFirst();
  }

  return await ctx.prisma.user.findUnique({
    where: {
      email: ctx.user?.email ?? "",
    },
    select,
  });
};

export default getUserGQL;
