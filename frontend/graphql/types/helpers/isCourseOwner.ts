import type { Context } from "../../context";

export const isCourseOwner = async (courseId: string, ctx: Context) =>
  (
    await ctx.prisma.user.findMany({
      where: {
        email: ctx.user?.email ?? "",
        coursesOwned: {
          some: {
            id: courseId ?? "",
          },
        },
      },
      select: {
        id: true,
      },
    })
  ).length > 0;
