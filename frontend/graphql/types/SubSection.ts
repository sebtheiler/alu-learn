import getUserGQL from "../../lib/getUserGQL";
import { isCourseOwner } from "./helpers/isCourseOwner";
import { extendType, nonNull, objectType, stringArg } from "nexus";

const SubSection = objectType({
  name: "SubSection",
  definition(t) {
    t.string("id");
    t.string("title");
    // t.field("flashcards", {
    //   type: list("User"),
    //   resolve(mainSection, _args, ctx) {
    //     return ctx.prisma.subSection.findMany({
    //       where: {
    //         mainSectionId: mainSection.id as string,
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
      args: {
        title: nonNull(stringArg()),
        mainSectionId: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx)) return null;

        return ctx.prisma.subSection.create({
          data: {
            title: args.title as string,
            mainSection: {
              connect: {
                id: args.mainSectionId as string,
              },
            },
          },
        });
      },
    });
  },
});

export default SubSection;
