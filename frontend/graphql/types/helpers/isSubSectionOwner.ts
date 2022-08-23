import type { Context } from "../../context";
import isMainSectionOwner from "./isMainSectionOwner";

const isSubSectionOwner = async (subSectionId: string, ctx: Context) => {
  const { mainSectionId } =
    (await ctx.prisma.subSection.findUnique({
      where: {
        id: subSectionId ?? null,
      },
      select: {
        mainSectionId: true,
      },
    })) ?? {};

  return mainSectionId && isMainSectionOwner(mainSectionId, ctx);
};

export default isSubSectionOwner;
