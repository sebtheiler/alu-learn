import DateScalar from "./scalars/DateScalar";
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
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const reviewInstance = await ctx.prisma.reviewInstance.findUnique({
          where: { id: args.reviewInstanceId },
        });

        return reviewInstance;
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
