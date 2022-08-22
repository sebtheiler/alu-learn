import getUserGQL from "../../lib/getUserGQL";
import isAdmin from "../../lib/isAdmin";
import {
  objectType,
  enumType,
  extendType,
  intArg,
  booleanArg,
  arg,
  stringArg,
} from "nexus";
import type { NonNullableKeys } from "types";

const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("username");
    t.string("name");
    t.string("email");
    t.field("newUserSurveyResponse", {
      type: "NewUserSurveyResponse",
      description: "The user's response to the survey launched on sign-up",
      resolve(user, _args, ctx) {
        return ctx.prisma.newUserSurveyResponse.findUnique({
          where: {
            userId: user.id as string,
          },
        });
      },
    });

    t.field("role", { type: Role });
    t.field("userType", { type: "UserType" });

    // Settings
    t.boolean("sendReminders");
    t.int("targetNumCards");
    t.boolean("sendMarketingResearch");
    t.int("timezoneOffset");
  },
});

export default User;

export const UsersQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("users", {
      type: User,
      description: "List all users",
      async resolve(_parent, _args, ctx) {
        if (!(await isAdmin(ctx))) return null;

        return ctx.prisma.user.findMany();
      },
    });
    t.field("me", {
      type: "User",
      description: "Get information on the current user",
      resolve(_parent, _args, ctx) {
        return getUserGQL(ctx);
      },
    });
  },
});

export const UsersMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("updateUser", {
      type: "User",
      description: "Change the user's settings",
      args: {
        name: stringArg(),
        timezoneOffset: intArg(),
        sendMarketingResearch: booleanArg(),
        targetNumCards: intArg(),
        sendReminders: booleanArg(),
        userType: arg({ type: "UserType" }),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const data: Partial<NonNullableKeys<typeof args>> = {};
        if (args.name != null) data.name = args.name;
        if (args.timezoneOffset != null)
          data.timezoneOffset = args.timezoneOffset;
        if (args.sendMarketingResearch != null)
          data.sendMarketingResearch = args.sendMarketingResearch;
        if (args.targetNumCards != null)
          data.targetNumCards = args.targetNumCards;
        if (args.sendReminders != null) data.sendReminders = args.sendReminders;
        if (args.userType != null) data.userType = args.userType;

        return ctx.prisma.user.update({
          where: { id: user.id },
          data: data,
        });
      },
    });
  },
});

export const Role = enumType({
  name: "Role",
  members: ["USER", "STAFF", "ADMIN"],
});

export const UserType = enumType({
  name: "UserType",
  members: ["STUDENT", "TEACHER", "MIXED"],
});
