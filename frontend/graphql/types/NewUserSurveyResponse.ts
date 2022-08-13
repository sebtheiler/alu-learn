import { UserType } from ".";
import getUserGQL from "../../lib/getUserGQL";
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
    t.int("targetNumCards");
    t.boolean("sendReminders");
    t.field("deckChoice", { type: DeckChoice });
  },
});

export default NewUserSurveyResponse;

export const NewUserSurveyResponseMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createNewUserSurveyResponse", {
      type: NewUserSurveyResponse,
      args: {
        timezoneOffset: nonNull(intArg()),
        userType: nonNull(arg({ type: "UserType" })),
        referrer: nonNull(arg({ type: "Referrer" })),
        joinReason: nonNull(arg({ type: "JoinReason" })),
        targetNumCards: nonNull(intArg()),
        sendReminders: nonNull(booleanArg()),
        deckChoice: nonNull(arg({ type: "DeckChoice" })),
      },
      async resolve(_root, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const newUserSurveyResponse = {
          timezoneOffset: args.timezoneOffset,
          userType: args.userType,
          referrer: args.referrer,
          joinReason: args.joinReason,
          targetNumCards: args.targetNumCards,
          sendReminders: args.sendReminders,
          deckChoice: args.deckChoice,
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

export const DeckChoice = enumType({
  name: "DeckChoice",
  members: ["CREATE_OWN", "COPY_EXISTING"],
});
