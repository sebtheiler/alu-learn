import { User as PrismaUser } from "@prisma/client";
import getUserGQL from "helpers/getUserGQL";
import isAdmin from "helpers/isAdmin";
import {
  objectType,
  enumType,
  extendType,
  intArg,
  booleanArg,
  arg,
  stringArg,
  list,
  nonNull,
} from "nexus";

const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("username");
    t.string("name");
    t.string("email");
    t.string("image");
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
    t.boolean("isPro");

    // Settings
    t.int("targetNumReviews");
    t.boolean("sendReminders");
    t.boolean("sendMarketingResearch");
    t.int("timezoneOffset");

    // Streak
    t.int("currentStreak");
    t.boolean("doneReviewsToday");
    t.int("numReviewsDoneToday");
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
        return getUserGQL(ctx, null);
      },
    });
    t.field("searchUsers", {
      type: list("User"),
      description: "Search for users",
      args: {
        name: nonNull(stringArg()),
      },
      resolve(_parent, args, ctx) {
        if (args.name.length < 3) return null;
        return ctx.prisma.user.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: args.name,
                  mode: "insensitive",
                },
              },
              {
                username: {
                  contains: args.name,
                  mode: "insensitive",
                },
              },
            ],
          },
          take: 25,
        });
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
        targetNumReviews: intArg(),
        userType: arg({ type: "UserType" }),
        sendReminders: booleanArg(),
        sendGeneral: booleanArg(),
        sendWeeklyReports: booleanArg(),
        sendMarketingResearch: booleanArg(),
        unsubscribeAll: booleanArg(),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const data: Partial<PrismaUser> = {};
        if (args.name != null) data.name = args.name;
        if (args.timezoneOffset != null)
          data.timezoneOffset = args.timezoneOffset;
        if (args.targetNumReviews != null)
          data.targetNumReviews = args.targetNumReviews;
        if (args.userType != null) data.userType = args.userType;
        if (args.sendReminders != null) data.sendReminders = args.sendReminders;
        if (args.sendGeneral != null) data.sendGeneral = args.sendGeneral;
        if (args.sendWeeklyReports != null)
          data.sendWeeklyReports = args.sendWeeklyReports;
        if (args.sendMarketingResearch != null)
          data.sendMarketingResearch = args.sendMarketingResearch;
        if (args.unsubscribeAll != null)
          data.unsubscribeAll = args.unsubscribeAll;

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
