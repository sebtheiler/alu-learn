import Flashcard from "./Flashcard";
import { JSONData } from "./scalars";
import type { SubSection as PrismaSubSection } from "@prisma/client";
import getUserGQL from "helpers/getUserGQL";
import isCourseSectionOwner from "helpers/isCourseSectionOwner";
import isCourseUser from "helpers/isCourseUser";
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

export const SubSectionQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("findHardestSubSections", {
      type: list(JSONData),
      description:
        "Find subsections sorted by difficulty. Returns subsections with custom `avgEase` and `courseSectionSlug` attributes",
      args: {
        courseId: nonNull(stringArg()),
        skip: intArg({ description: "used in pagination" }),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (
          !user ||
          !(await isCourseUser(args.courseId, ctx.user?.email, ctx.prisma))
        )
          return null;

        // Maybe this will eventually be possible in Prisma w/o raw SQL
        // https://github.com/prisma/prisma/issues/10866
        return await ctx.prisma.$queryRaw`
          SELECT
            "SubSection"."id",
            "SubSection"."title",
            "SubSection"."slug",
            "CourseSection"."slug" AS "courseSectionSlug",
            AVG("ReviewInstance"."ease") AS "avgEase"
          FROM
            "SubSection"
            INNER JOIN "CourseSection" ON (
              "SubSection"."courseSectionId" = "CourseSection"."id"
            )
            LEFT OUTER JOIN "Flashcard" ON (
              "SubSection"."id" = "Flashcard"."subSectionId"
            )
            LEFT OUTER JOIN "ReviewInstance" ON (
              "Flashcard"."id" = "ReviewInstance"."flashcardId"
            )
          WHERE
            "CourseSection"."courseId" = ${args.courseId}
            AND "ReviewInstance"."userId" = ${user.id}
          GROUP BY
            "SubSection"."id",
            "CourseSection"."slug" -- not sure why this is required https://stackoverflow.com/questions/19601948/must-appear-in-the-group-by-clause-or-be-used-in-an-aggregate-function
          HAVING
            COUNT("ReviewInstance") > 0
          ORDER BY
            "avgEase" ASC
        `;
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
