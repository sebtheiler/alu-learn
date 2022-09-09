import { UserType } from ".";
import getUserGQL from "helpers/getUserGQL";
import {
  objectType,
  extendType,
  enumType,
  intArg,
  arg,
  booleanArg,
  nonNull,
} from "nexus";

const NewUserSurveyResponse = objectType({
  name: "NewUserSurveyResponse",
  definition(t) {
    t.string("id");
    t.field("user", { type: "User" });
    t.string("userId");

    t.int("timezoneOffset");
    t.field("userType", { type: UserType });
    t.field("referrer", { type: Referrer });
    t.field("joinReason", { type: JoinReason });
    t.int("targetNumReviews");
    t.boolean("sendReminders");
  },
});

export default NewUserSurveyResponse;

export const NewUserSurveyResponseMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createNewUserSurveyResponse", {
      type: NewUserSurveyResponse,
      description:
        "Creates a new NewUserSurveyResponse from a set of responses",
      args: {
        timezoneOffset: nonNull(intArg()),
        userType: nonNull(arg({ type: "UserType" })),
        referrer: nonNull(arg({ type: "Referrer" })),
        joinReason: nonNull(arg({ type: "JoinReason" })),
        targetNumReviews: nonNull(intArg()),
        sendReminders: nonNull(booleanArg()),
      },
      async resolve(_root, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const newUserSurveyResponse = {
          timezoneOffset: args.timezoneOffset,
          userType: args.userType,
          referrer: args.referrer,
          joinReason: args.joinReason,
          targetNumReviews: args.targetNumReviews,
          sendReminders: args.sendReminders,
          userId: user.id,
        };

        return ctx.prisma.newUserSurveyResponse.create({
          data: newUserSurveyResponse,
        });
      },
    });
  },
});

export const Referrer = enumType({
  name: "Referrer",
  members: [
    "FRIENDS",
    "TEACHER",
    "INSTA",
    "REDDIT",
    "TIKTOK",
    "YOUTUBE",
    "NEWS",
    "SEARCH",
  ],
});

export const JoinReason = enumType({
  name: "JoinReason",
  members: ["MEMORY", "GRADES", "CONCEPT", "TEACHER", "STUDENTS"],
});
