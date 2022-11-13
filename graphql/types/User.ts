import { User as PrismaUser } from "@prisma/client";
import { ApolloError } from "apollo-server-micro";
import createEmailTemplate from "emails/createEmailTemplate";
import sendEmail from "emails/sendEmail";
import friendUsers from "helpers/friendUsers";
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
              {
                email: {
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
    t.list.field("myFriends", {
      type: "JSONObject",
      description:
        "Get a list of the user's friends and the number of flashcards they've studied this week. Also includes the current user",
      async resolve(_parent, _args, ctx) {
        const me = await getUserGQL(ctx, {
          id: true,
          name: true,
          username: true,
          image: true,
          friends: {
            select: { name: true, username: true, id: true, image: true },
          },
        });
        if (!me) return null;

        const friends: (PrismaUser & { reviewsStudied: number })[] = [];

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // @ts-ignore
        for (const friend of me.friends as PrismaUser[]) {
          const {
            _sum: { reviewsStudied },
          } = await ctx.prisma.historySegment.aggregate({
            where: {
              userId: friend.id,
              date: {
                gte: weekAgo,
              },
            },
            _sum: {
              reviewsStudied: true,
            },
          });

          friends.push({
            ...friend,
            reviewsStudied: reviewsStudied ?? 0,
          });
        }

        if (friends.length > 0) {
          const {
            _sum: { reviewsStudied },
          } = await ctx.prisma.historySegment.aggregate({
            where: {
              userId: me.id,
              date: {
                gte: weekAgo,
              },
            },
            _sum: {
              reviewsStudied: true,
            },
          });

          friends.push({
            ...(me as PrismaUser),
            name: "You",
            reviewsStudied: reviewsStudied ?? 0,
          });
        }

        return friends.sort((a, b) => b.reviewsStudied - a.reviewsStudied);
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
    t.field("addFriend", {
      type: "Boolean",
      description:
        "Sends a friend request or accepts an existing friend request",
      args: {
        userId: nonNull(
          stringArg({ description: "User to request/add as a friend" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const me = await getUserGQL(ctx, {
          id: true,
          name: true,
          username: true,
        }); // the current user
        if (!me) return null;
        const other = await ctx.prisma.user.findUnique({
          where: { id: args.userId },
          select: { username: true, id: true, email: true },
        }); // the user that me wants to be friends with
        if (!other) throw new ApolloError("User to request not found");

        // If me has already requested other, or the two are already friends, do nothing
        const meRequestedOtherOrAlreadyFriends =
          (await ctx.prisma.user.count({
            where: {
              id: me.id,
              OR: [
                {
                  // Me requested other
                  friendsRequested: {
                    some: {
                      id: other.id,
                    },
                  },
                },
                {
                  // Already friends
                  friends: {
                    some: {
                      id: other.id,
                    },
                  },
                },
              ],
            },
          })) > 0;

        if (meRequestedOtherOrAlreadyFriends) return null;

        const otherRequestedMe =
          (await ctx.prisma.user.count({
            where: {
              id: me.id,
              requestedFriends: {
                some: {
                  id: other.id,
                },
              },
            },
          })) > 0;

        if (otherRequestedMe) {
          // If other has requested to be friends with me, add immediately
          friendUsers(me.id as string, other.id, ctx.prisma);

          return true;
        } else {
          // Otherwise, me requests to be friends with other
          await ctx.prisma.user.update({
            where: {
              id: me.id,
            },
            data: {
              friendsRequested: {
                connect: {
                  id: other.id,
                },
              },
            },
          });

          // Send email to other to notify them of the friend request
          const template = createEmailTemplate("friendRequest");
          await sendEmail({
            to: other.email as string,
            subject: `Friend Request from ${me.name}`,
            html: template({
              title: `Friend Request from ${me.name}`,
              requesterName: me.name,
              requesterUsername: me.username,
            }),
          });

          return false;
        }
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
