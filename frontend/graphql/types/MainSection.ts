import getUserGQL from "../../lib/getUserGQL";
import isCourseOwner from "./helpers/isCourseOwner";
import isMainSectionOwner from "./helpers/isMainSectionOwner";
import { extendType, list, nonNull, objectType, stringArg } from "nexus";
import type { NonNullableKeys } from "types";

const MainSection = objectType({
  name: "MainSection",
  definition(t) {
    t.string("id");
    t.string("title");
    t.field("subSections", {
      type: list("SubSection"),
      resolve(mainSection, _args, ctx) {
        return ctx.prisma.subSection.findMany({
          where: {
            mainSectionId: mainSection.id ?? "",
          },
        });
      },
    });
  },
});

export const MainSectionMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createMainSection", {
      type: MainSection,
      description:
        "Creates a new main section and populates it with a default subsection",
      args: {
        title: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx)) return null;

        const mainSection = await ctx.prisma.mainSection.create({
          data: {
            title: args.title as string,
            courseId: args.courseId as string,
          },
        });

        await ctx.prisma.subSection.create({
          data: {
            title: "Default",
            mainSectionId: mainSection.id,
          },
        });

        return mainSection;
      },
    });
    t.field("updateMainSection", {
      type: "MainSection",
      description: "Change a main section's settings",
      args: {
        title: stringArg(),
        mainSectionId: nonNull(
          stringArg({ description: "ID of the main section to update" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isMainSectionOwner(args.mainSectionId, ctx)) return null;

        const data: Partial<NonNullableKeys<typeof args>> = {};
        if (args.title != null) data.title = args.title;

        return ctx.prisma.mainSection.update({
          where: { id: args.mainSectionId },
          data: data,
        });
      },
    });
    t.field("deleteMainSection", {
      type: "MainSection",
      description: "Deletes a main section",
      args: {
        mainSectionId: nonNull(
          stringArg({ description: "ID of the main section to delete" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isMainSectionOwner(args.mainSectionId, ctx)) return null;

        return ctx.prisma.mainSection.delete({
          where: { id: args.mainSectionId },
        });
      },
    });
  },
});

export default MainSection;
