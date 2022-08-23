import type { Context } from "../../context";
import isCourseOwner from "./isCourseOwner";

const isCourseSectionOwner = async (courseSectionId: string, ctx: Context) => {
  const { courseId } =
    (await ctx.prisma.courseSection.findUnique({
      where: {
        id: courseSectionId ?? null,
      },
      select: {
        courseId: true,
      },
    })) ?? {};

  return courseId && isCourseOwner(courseId, ctx);
};

export default isCourseSectionOwner;
