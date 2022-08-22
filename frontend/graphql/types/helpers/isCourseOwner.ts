import type { Context } from "../../context";

export const isCourseOwner = async (courseId: string, ctx: Context) =>
  (await ctx.prisma.user.count({
    where: {
      email: ctx.user?.email ?? "",
      coursesOwned: {
        some: {
          id: courseId ?? "",
        },
      },
    },
  })) > 0;
