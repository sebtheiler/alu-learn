import type { Context } from "../../context";
import isCourseSectionOwner from "./isCourseSectionOwner";

const isSubSectionOwner = async (subSectionId: string, ctx: Context) => {
  const { courseSectionId } =
    (await ctx.prisma.subSection.findUnique({
      where: {
        id: subSectionId ?? null,
      },
      select: {
        courseSectionId: true,
      },
    })) ?? {};

  return courseSectionId && isCourseSectionOwner(courseSectionId, ctx);
};

export default isSubSectionOwner;
