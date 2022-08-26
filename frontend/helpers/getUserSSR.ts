import type { User, Prisma } from "@prisma/client";
import prisma from "lib/prisma";
import type { Session } from "next-auth";

/**
 * Get the current user
 * @param session NextAuth session
 * @returns The current user or null
 */
const getUserSSR = async (
  session: Session | null,
  select: Prisma.UserSelect = {}
): Promise<Partial<User> | null> => {
  // if (process.env.NODE_ENV === "development" && !session) {
  //   return prisma.user.findFirst();
  // }

  if (!session) return null;

  return await prisma.user.findUnique({
    where: {
      email: session.user?.email ?? "",
    },
    select: select,
  });
};

export default getUserSSR;
