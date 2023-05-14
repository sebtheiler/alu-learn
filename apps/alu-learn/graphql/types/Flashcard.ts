import { ApolloError } from "@apollo/client/errors";
import type {
  Flashcard as PrismaFlashcard,
  FlashcardType as PrismaFlashcardType,
  Prisma,
} from "@prisma/client";
import canEditCourse from "helpers/canEditCourse";
import canViewCourse from "helpers/canViewCourse";
import getUserGQL from "helpers/getUserGQL";
import isCourseOwner from "helpers/isCourseOwner";
import isSubSectionOwner from "helpers/isSubSectionOwner";
import moveObject from "helpers/moveObject";
import {
  arg,
  booleanArg,
  enumType,
  extendType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";
import { createCourse } from "./Course";
import type { Course, CourseSection, SubSection } from "@/types";
import { generateLexicalElement } from "lexical-editor/src/helpers/blankLexicalElement";

const Flashcard = objectType({
  name: "Flashcard",
  definition(t) {
    t.string("id");
    t.string("fields");
    t.string("courseId");
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

        // Only if called from Alu Learn
        courseId: stringArg(),
        courseSectionSlug: stringArg(),
        subSectionSlug: stringArg(),

        // Only if called from Alu Read
        isForAluRead: booleanArg(),
        extractId: stringArg(),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          selectedAluReadCourseId: true,
        });
        if (!user) return null;

        if (args.isForAluRead && !user.selectedAluReadCourseId)
          throw new ApolloError({
            errorMessage:
              "Must have `selectedAluReadCourseId` set if creating flashcard for Alu Read",
          });
        const subSectionSlug = args.isForAluRead
          ? "default"
          : (args.subSectionSlug as string);
        const courseSectionSlug = args.isForAluRead
          ? "default"
          : (args.courseSectionSlug as string);
        const courseId = args.isForAluRead
          ? (user.selectedAluReadCourseId as string)
          : (args.courseId as string);

        const subSection = await ctx.prisma.subSection.findFirstOrThrow({
          where: {
            slug: subSectionSlug,
            courseSection: {
              slug: courseSectionSlug,
              courseId: courseId,
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
            extractId: args.extractId,
            subSection: {
              connect: {
                id: subSection.id,
              },
            },
            course: {
              connect: {
                id: courseId,
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
    t.field("moveFlashcardToSubSection", {
      type: "String",
      description: "Move a flashcard from one sub section to another",
      args: {
        flashcardId: nonNull(
          stringArg({ description: "ID of the flashcard to move" })
        ),
        subSectionId: nonNull(
          stringArg({
            description: "ID of the sub section to move the flashcard to",
          })
        ),
      },
      async resolve(_parent, args, ctx) {
        const flashcard = await ctx.prisma.flashcard.findUnique({
          where: { id: args.flashcardId },
          select: { courseId: true, subSectionId: true, index: true },
        });
        if (
          !flashcard ||
          !(await canEditCourse(
            flashcard.courseId,
            ctx.user?.email,
            ctx.prisma
          ))
        )
          return null;

        // Shift all flashcards after the flashcard that was moved down in the
        // original sub section
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

        // Get the new index
        const newSubSection = await ctx.prisma.subSection.findUniqueOrThrow({
          where: {
            id: args.subSectionId,
          },
          select: {
            _count: {
              select: {
                flashcards: true,
              },
            },
            courseSection: {
              select: {
                slug: true,
              },
            },
            slug: true,
          },
        });
        const newIndex = newSubSection._count.flashcards;

        // Move the flashcard
        await ctx.prisma.flashcard.update({
          where: {
            id: args.flashcardId,
          },
          data: {
            index: newIndex,
            subSectionId: args.subSectionId,
          },
        });

        // Return the URL
        return `/course/${flashcard.courseId}/flashcards/${newSubSection.courseSection.slug}/${newSubSection.slug}`;
      },
    });
    t.field("importFlashcards", {
      type: "String",
      description:
        "Import flashcards from a tab-separated text file. Returns new URL",
      args: {
        importTxt: nonNull(stringArg()),
        courseTitle: stringArg(),
        subSectionId: stringArg(),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        let subSection: SubSection | undefined;
        let courseSection: CourseSection | undefined;
        let course: Course | undefined;

        if (args.courseTitle) {
          // Create new course with title
          const {
            course: newCourse,
            courseSection: newCourseSection,
            subSection: newSubSection,
          } = await createCourse(
            args.courseTitle,
            user.id as string,
            ctx.prisma
          );
          subSection = newSubSection;
          courseSection = newCourseSection;
          course = newCourse as Course;
        } else if (args.subSectionId) {
          // Add to existing sub section
          subSection = await ctx.prisma.subSection.findUniqueOrThrow({
            where: { id: args.subSectionId },
            select: {
              slug: true,
              id: true,
              courseSection: {
                select: { slug: true, course: { select: { id: true } } },
              },
            },
          });

          // @ts-ignore
          courseSection = subSection.courseSection;
          // @ts-ignore
          course = courseSection.course;
        }

        if (!(subSection && courseSection && course))
          throw new ApolloError({
            errorMessage:
              "Couldn't find sub section, course section, and course",
          });

        const startingIndex = await ctx.prisma.flashcard.count({
          where: { subSectionId: subSection.id as string },
        });
        const flashcards: Partial<PrismaFlashcard>[] = [];

        const lines = args.importTxt.split("\n");
        for (const [i, line] of lines.entries()) {
          const [front, back] = line.split("\t");
          flashcards.push({
            fields: JSON.stringify([
              generateLexicalElement(front.replaceAll("\\n", "\n")),
              generateLexicalElement(back.replaceAll("\\n", "\n")),
            ]),
            tags: "",
            index: startingIndex + i,
            subSectionId: subSection.id as string,
            courseId: course.id as string,
          });
        }

        await ctx.prisma.flashcard.createMany({
          data: flashcards as PrismaFlashcard[],
        });

        return `/course/${course.id}/flashcards/${courseSection.slug}/${subSection.slug}`;
      },
    });
  },
});

export default Flashcard;

export const FlashcardType = enumType({
  name: "FlashcardType",
  members: ["NORMAL", "CLOZE"],
});
