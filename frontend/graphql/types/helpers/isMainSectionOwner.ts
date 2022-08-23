import type { Context } from "../../context";
import isCourseOwner from "./isCourseOwner";

const isMainSectionOwner = async (mainSectionId: string, ctx: Context) => {
  const { courseId } =
    (await ctx.prisma.mainSection.findUnique({
      where: {
        id: mainSectionId ?? null,
      },
      select: {
        courseId: true,
      },
    })) ?? {};

  return courseId && isCourseOwner(courseId, ctx);
};

export default isMainSectionOwner;
