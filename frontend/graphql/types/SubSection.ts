import getUserGQL from "../../lib/getUserGQL";
import isCourseOwner from "./helpers/isCourseOwner";
import isSubSectionOwner from "./helpers/isSubSectionOwner";
import { extendType, nonNull, objectType, stringArg } from "nexus";
import type { NonNullableKeys } from "types";

const SubSection = objectType({
  name: "SubSection",
  definition(t) {
    t.string("id");
    t.string("title");
    // t.field("flashcards", {
    //   type: list("User"),
    //   resolve(courseSection, _args, ctx) {
    //     return ctx.prisma.subSection.findMany({
    //       where: {
    //         courseSectionId: courseSection.id as string,
    //       },
    //     });
    //   },
    // });
  },
});

export const SubSectionMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createSubSection", {
      type: SubSection,
      description: "Creates a new sub section",
      args: {
        title: nonNull(stringArg()),
        courseSectionId: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx)) return null;

        return ctx.prisma.subSection.create({
          data: {
            title: args.title as string,
            courseSection: {
              connect: {
                id: args.courseSectionId as string,
              },
            },
          },
        });
      },
    });
    t.field("updateSubSection", {
      type: "SubSection",
      description: "Change a sub section's settings",
      args: {
        title: stringArg(),
        subSectionId: nonNull(
          stringArg({ description: "ID of the sub section to update" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isSubSectionOwner(args.subSectionId, ctx)) return null;

        const data: Partial<NonNullableKeys<typeof args>> = {};
        if (args.title != null) data.title = args.title;

        return ctx.prisma.subSection.update({
          where: { id: args.subSectionId },
          data: data,
        });
      },
    });
    t.field("deleteSubSection", {
      type: "SubSection",
      description: "Deletes a sub section",
      args: {
        subSectionId: nonNull(
          stringArg({ description: "ID of the sub section to delete" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isSubSectionOwner(args.subSectionId, ctx)) return null;

        return ctx.prisma.subSection.delete({
          where: { id: args.subSectionId },
        });
      },
    });
  },
});

export default SubSection;
