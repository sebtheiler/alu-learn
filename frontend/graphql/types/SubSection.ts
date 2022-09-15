import Flashcard from "./Flashcard";
import type { SubSection as PrismaSubSection } from "@prisma/client";
import getUserGQL from "helpers/getUserGQL";
import isCourseSectionOwner from "helpers/isCourseSectionOwner";
import isSubSectionOwner from "helpers/isSubSectionOwner";
import moveObject from "helpers/moveObject";
import slugifyText from "helpers/slugifyText";
import {
  extendType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

const SubSection = objectType({
  name: "SubSection",
  definition(t) {
    t.string("id");
    t.string("title");
    t.string("slug");
    t.field("flashcards", {
      type: list(Flashcard),
      resolve(subSection, _args, ctx) {
        return ctx.prisma.flashcard.findMany({
          where: {
            subSectionId: subSection.id as string,
          },
        });
      },
    });
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
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (
          !user ||
          !isCourseSectionOwner(
            args.courseSectionId,
            ctx.user?.email,
            ctx.prisma
          )
        )
          return null;

        const newIndex = await ctx.prisma.subSection.count({
          where: {
            courseSectionId: args.courseSectionId,
          },
        });

        return ctx.prisma.subSection.create({
          data: {
            title: args.title,
            slug: slugifyText(args.title),
            index: newIndex,
            courseSection: {
              connect: {
                id: args.courseSectionId,
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
        if (
          !user ||
          !isSubSectionOwner(args.subSectionId, ctx.user?.email, ctx.prisma)
        )
          return null;

        const data: Partial<PrismaSubSection> = {};
        if (args.title != null) {
          data.title = args.title;
          data.slug = slugifyText(args.title);
        }

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
        if (
          !user ||
          !isSubSectionOwner(args.subSectionId, ctx.user?.email, ctx.prisma)
        )
          return null;

        return ctx.prisma.subSection.delete({
          where: { id: args.subSectionId },
        });
      },
    });
    t.field("moveSubSection", {
      type: "SubSection",
      description: "Moves a sub section from a position to another",
      args: {
        courseSectionId: nonNull(stringArg()),
        from: nonNull(intArg()),
        to: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (
          !user ||
          !isCourseSectionOwner(args.courseSectionId, ctx.user?.email)
        )
          return null;

        return moveObject({
          objType: "SUB_SECTION",
          from: args.from,
          to: args.to,
          parentQuery: { courseSectionId: args.courseSectionId },
          objQuery: {
            courseSectionId: args.courseSectionId,
          },
          ctx,
        });
      },
    });
  },
});

export default SubSection;
