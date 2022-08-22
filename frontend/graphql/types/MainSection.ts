import getUserGQL from "../../lib/getUserGQL";
import { isCourseOwner } from "./helpers/isCourseOwner";
import { extendType, list, nonNull, objectType, stringArg } from "nexus";

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
      args: {
        title: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx)) return null;

        return ctx.prisma.mainSection.create({
          data: {
            title: args.title as string,
            course: {
              connect: {
                id: args.courseId as string,
              },
            },
          },
        });
      },
    });
  },
});

export default MainSection;
