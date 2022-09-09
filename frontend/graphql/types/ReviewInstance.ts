import DateScalar from "./scalars/DateScalar";
import { ApolloError } from "apollo-server-micro";
import calculateInterval from "helpers/calculateInterval";
import getUserGQL from "helpers/getUserGQL";
import {
  arg,
  enumType,
  extendType,
  intArg,
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
  },
});

export default ReviewInstance;

export const UsersMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("studyReviewInstance", {
      type: ReviewInstance,
      description: "Change the user's settings",
      args: {
        timezoneOffset: nonNull(intArg()),
        timeTaken: nonNull(intArg({ description: "In ms" })),
        reviewInstanceId: nonNull(stringArg()),
        grade: nonNull(arg({ type: Grade })),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          doneReviewsToday: true,
          numReviewsDoneToday: true,
          currentStreak: true,
        });
        if (!user) return null;

        const reviewInstance = await ctx.prisma.reviewInstance.findUnique({
          where: { id: args.reviewInstanceId },
        });
        if (!reviewInstance || reviewInstance.userId !== user.id)
          throw new ApolloError(
            "Unauthorized to access given reviewInstanceId"
          );
        const interval = calculateInterval(reviewInstance, args.grade);

        if (!interval) throw new ApolloError("Error calculating interval");
        const { updatedReviewInstance } = interval;
        console.log(user);
        console.log("done reviewstoday", user.doneReviewsToday);

        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            numReviewsDoneToday: (user.numReviewsDoneToday as number) + 1,
            currentStreak: user.doneReviewsToday
              ? undefined
              : (user.currentStreak as number) + 1,
            doneReviewsToday: user.doneReviewsToday ? undefined : true,
          },
        });

        return ctx.prisma.reviewInstance.update({
          where: {
            id: args.reviewInstanceId,
          },
          data: updatedReviewInstance,
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
