import { percentCompleteCacheKey } from "./SubSection";
import DateScalar from "./scalars/DateScalar";
import type { ReviewInstance as PrismaReviewInstance } from "@prisma/client";
import { ApolloError } from "apollo-server-micro";
import calculateInterval from "helpers/calculateInterval";
import getUserGQL from "helpers/getUserGQL";
import isCourseUser from "helpers/isCourseUser";
import updateUserHistory from "helpers/updateUserHistory";
import globalCache from "lib/globalCache";
import {
  arg,
  booleanArg,
  enumType,
  extendType,
  floatArg,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

const ReviewInstance = objectType({
  name: "ReviewInstance",
  definition(t) {
    t.string("id");
    t.field("learningStatus", { type: LearningStatus });
    t.int("stepsIndex");
    t.int("ease");
    t.field("nextReview", { type: DateScalar });
    t.field("lastReview", { type: DateScalar });
    t.field("flashcard", { type: "Flashcard" });
    t.boolean("isStarred");
    t.string("name");
  },
});

export default ReviewInstance;

export const ReviewInstanceQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("findHardestReviewInstances", {
      type: list(ReviewInstance),
      description: "Find review instances sorted by difficulty",
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

        return ctx.prisma.reviewInstance.findMany({
          where: {
            flashcard: {
              courseId: args.courseId,
            },
            userId: user.id,
          },
          orderBy: {
            ease: "asc",
          },
          select: {
            id: true,
            ease: true,
            flashcard: {
              select: {
                fields: true,
                id: true,
                tags: true,
              },
            },
          },
          take: 50,
          skip: args.skip ?? 0,
        });
      },
    });
  },
});

export const ReviewInstancesMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("studyReviewInstance", {
      type: ReviewInstance,
      description: "Change the user's settings",
      args: {
        timeTaken: nonNull(floatArg({ description: "In ms" })),
        reviewInstanceId: nonNull(stringArg()),
        grade: nonNull(arg({ type: Grade })),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          doneReviewsToday: true,
          numReviewsDoneToday: true,
          currentStreak: true,
          longestStreak: true,
          timezoneOffset: true,
        });
        if (!user) return null;

        const reviewInstance = await ctx.prisma.reviewInstance.findUnique({
          where: { id: args.reviewInstanceId },
          select: {
            id: true,
            userId: true,
            lastReview: true,
            nextReview: true,
            learningStatus: true,
            stepsIndex: true,
            ease: true,
            flashcard: {
              select: {
                subSectionId: true,
              },
            },
          },
        });
        if (!reviewInstance || reviewInstance.userId !== user.id)
          throw new ApolloError(
            "Unauthorized to access given reviewInstanceId"
          );

        // Calculate interval
        const interval = calculateInterval(reviewInstance, args.grade);
        if (!interval) throw new ApolloError("Error calculating interval");
        const { updatedReviewInstance } = interval;

        const newStreak = user.doneReviewsToday
          ? undefined
          : (user.currentStreak as number) + 1;
        // Update user and history
        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            numReviewsDoneToday: (user.numReviewsDoneToday as number) + 1,
            currentStreak: newStreak,
            longestStreak:
              newStreak && newStreak > (user.longestStreak ?? 0)
                ? newStreak
                : undefined,
            doneReviewsToday: user.doneReviewsToday ? undefined : true,
          },
        });

        await updateUserHistory(user, args.timeTaken, ctx.prisma);

        // Clear sub section cache
        globalCache.del(
          percentCompleteCacheKey(
            reviewInstance.flashcard.subSectionId,
            user.id
          )
        );

        // Log review instance history
        await ctx.prisma.reviewInstanceHistory.create({
          data: {
            gradeResponse: args.grade,
            timeTaken: args.timeTaken,
            ease: reviewInstance.ease,
            learningStatus: reviewInstance.learningStatus,
            stepsIndex: reviewInstance.stepsIndex,
            nextReview: reviewInstance.nextReview,
            lastReview: reviewInstance.lastReview,
            reviewInstance: {
              connect: {
                id: reviewInstance.id,
              },
            },
          },
        });

        // Update review instance
        return ctx.prisma.reviewInstance.update({
          where: {
            id: args.reviewInstanceId,
          },
          data: { ...updatedReviewInstance, lastReview: new Date() },
        });
      },
    });
    t.field("updateReviewInstance", {
      type: ReviewInstance,
      description: "Update metadata for the review instance (not for studying)",
      args: {
        isStarred: booleanArg(),
        reviewInstanceId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        const reviewInstance = await ctx.prisma.reviewInstance.findUnique({
          where: { id: args.reviewInstanceId },
          select: { userId: true },
        });
        if (!user || !reviewInstance || user.id !== reviewInstance.userId)
          return null;

        const data: Partial<PrismaReviewInstance> = {};
        if (args.isStarred !== null) data.isStarred = args.isStarred;

        return ctx.prisma.reviewInstance.update({
          where: { id: args.reviewInstanceId },
          data,
        });
      },
    });
  },
});

export const LearningStatus = enumType({
  name: "LearningStatus",
  members: ["UNSEEN", "LEARNING", "LEARNED", "RELEARNING"],
});

export const Grade = enumType({
  name: "Grade",
  members: ["AGAIN", "HARD", "GOOD", "EASY"],
});
