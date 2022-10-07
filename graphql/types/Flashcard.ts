import type {
  Flashcard as PrismaFlashcard,
  FlashcardType as PrismaFlashcardType,
  Prisma,
} from "@prisma/client";
import canViewCourse from "helpers/canViewCourse";
import getUserGQL from "helpers/getUserGQL";
import isCourseOwner from "helpers/isCourseOwner";
import isSubSectionOwner from "helpers/isSubSectionOwner";
import moveObject from "helpers/moveObject";
import {
  arg,
  enumType,
  extendType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

const Flashcard = objectType({
  name: "Flashcard",
  definition(t) {
    t.string("id");
    t.string("fields");
    t.string("tags");
    t.field("type", { type: FlashcardType });
  },
});

export const FlashcardQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getFlashcard", {
      type: Flashcard,
      description: "Gets a flashcard by its ID",
      args: {
        flashcardId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const flashcard = await ctx.prisma.flashcard.findUnique({
          where: {
            id: args.flashcardId,
          },
        });
        if (
          !flashcard ||
          !canViewCourse(flashcard?.courseId, ctx.user?.email, ctx.prisma)
        )
          return null;

        return flashcard;
      },
    });
    t.field("searchFlashcards", {
      type: list(Flashcard),
      description: "Finds flashcards based on some criteria",
      args: {
        text: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        if (!canViewCourse(args.courseId, ctx.user?.email, ctx.prisma))
          return null;

        const where: Prisma.FlashcardWhereInput = {
          fields: {
            contains: args.text,
            mode: "insensitive",
          },
          courseId: args.courseId,
        };

        return ctx.prisma.flashcard.findMany({
          where,
          take: 50,
        });
      },
    });
  },
});

export const FlashcardMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createFlashcard", {
      type: Flashcard,
      description: "Creates a new flashcard",
      args: {
        fields: nonNull(stringArg()),
        tags: stringArg(),
        flashcardType: arg({ type: FlashcardType }),
        courseId: nonNull(stringArg()),
        courseSectionSlug: nonNull(stringArg()),
        subSectionSlug: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        const subSection = await ctx.prisma.subSection.findFirstOrThrow({
          where: {
            slug: args.subSectionSlug,
            courseSection: {
              slug: args.courseSectionSlug,
              courseId: args.courseId,
            },
          },
          select: {
            id: true,
          },
        });
        if (
          !subSection ||
          !isSubSectionOwner(subSection.id, ctx.user?.email, ctx.prisma)
        )
          return null;

        const newIndex = await ctx.prisma.flashcard.count({
          where: {
            subSectionId: subSection.id,
          },
        });

        return ctx.prisma.flashcard.create({
          data: {
            fields: args.fields,
            tags: args.tags ?? "",
            index: newIndex,
            type: args.flashcardType as PrismaFlashcardType,
            subSection: {
              connect: {
                id: subSection.id,
              },
            },
            course: {
              connect: {
                id: args.courseId,
              },
            },
          },
        });
      },
    });
    t.field("updateFlashcard", {
      type: Flashcard,
      description: "Change a flashcard's data",
      args: {
        fields: stringArg(),
        tags: stringArg(),
        flashcardId: nonNull(
          stringArg({ description: "ID of the flashcard to update" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const flashcard = await ctx.prisma.flashcard.findUnique({
          where: { id: args.flashcardId },
          select: { courseId: true },
        });
        if (
          !flashcard ||
          !isCourseOwner(flashcard.courseId, ctx.user?.email, ctx.prisma)
        )
          return null;

        const data: Partial<PrismaFlashcard> = {};
        if (args.fields !== null) data.fields = args.fields;
        if (args.tags !== null) data.tags = args.tags;

        return ctx.prisma.flashcard.update({
          where: { id: args.flashcardId },
          data: data,
        });
      },
    });
    t.field("deleteFlashcard", {
      type: "Flashcard",
      description: "Deletes the given flashcard",
      args: {
        flashcardId: nonNull(
          stringArg({ description: "ID of the flashcard to delete" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        const flashcard = await ctx.prisma.flashcard.findUnique({
          where: { id: args.flashcardId },
          select: {
            id: true,
            index: true,
            courseId: true,
            subSectionId: true,
          },
        });
        if (
          !user ||
          !flashcard ||
          !isCourseOwner(flashcard.courseId, ctx.user?.email, ctx.prisma)
        )
          return null;

        // Decrease index of all flashcards after
        await ctx.prisma.flashcard.updateMany({
          where: {
            subSectionId: flashcard.subSectionId,
            index: {
              gt: flashcard.index,
            },
          },
          data: {
            index: {
              decrement: 1,
            },
          },
        });

        return ctx.prisma.flashcard.delete({
          where: {
            id: flashcard.id,
          },
        });
      },
    });
    t.field("moveFlashcard", {
      type: "Flashcard",
      description: "Moves a flashcard from a position to another",
      args: {
        courseId: nonNull(stringArg()),
        subSectionSlug: nonNull(stringArg()),
        from: nonNull(intArg()),
        to: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        const { id: subSectionId } =
          await ctx.prisma.subSection.findFirstOrThrow({
            where: {
              slug: args.subSectionSlug,
              courseSection: {
                courseId: args.courseId,
              },
            },
            select: {
              id: true,
            },
          });

        if (!user || !isCourseOwner(args.courseId, ctx.user?.email))
          return null;

        return moveObject({
          objType: "FLASHCARD",
          from: args.from,
          to: args.to,
          parentQuery: { subSectionId },
          objQuery: {
            subSection: {
              slug: args.subSectionSlug,
            },
            courseId: args.courseId,
          },
          ctx,
        });
      },
    });
  },
});

export default Flashcard;

export const FlashcardType = enumType({
  name: "FlashcardType",
  members: ["NORMAL", "CLOZE"],
});
