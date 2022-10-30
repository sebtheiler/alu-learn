import createEmailTemplate from "emails/createEmailTemplate";
import sendEmail from "emails/sendEmail";
import prisma from "lib/prisma";

/**
 * Sends an email to students who haven't studied in
 * the past to weeks in an attempt to get them back on board.
 * Sends no more than once per six months
 */
const sendReengagement = async () => {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const users = await prisma.user.findMany({
    where: {
      sendGeneral: true,
      unsubscribeAll: false,
      userType: "STUDENT",

      // Not WESS users
      NOT: {
        email: {
          contains: "westendsecondary",
          mode: "insensitive",
        },
      },

      // Only send if the account is 2+ weeks old
      createdAt: {
        lt: twoWeeksAgo,
      },

      // Send a maximum of once per 6 months
      OR: [
        {
          sentReengagement: null,
        },
        {
          NOT: {
            sentReengagement: {
              gt: sixMonthsAgo, // this is gt, not lt
            },
          },
        },
      ],
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      sentReengagement: true,
    },
  });

  const template = createEmailTemplate("reengagement");

  const sentToUsers: string[] = [];
  for (const user of users) {
    if (!user.email) continue;

    // Only send if the user has not studied within the past two weeks
    const {
      _sum: { reviewsStudied },
    } = await prisma.historySegment.aggregate({
      _sum: {
        reviewsStudied: true,
      },
      where: {
        date: {
          gte: twoWeeksAgo,
        },
        userId: user.id,
      },
    });
    if (reviewsStudied) continue;

    // Only send if the user did study in the week before those two weeks or...
    // NOTE: this is written as a function so that it doesn't have to be evaluated if the next condition is true
    const reviewsStudiedBefore = async () =>
      (
        await prisma.historySegment.aggregate({
          _sum: {
            reviewsStudied: true,
          },
          where: {
            date: {
              gte: threeWeeksAgo,
              lt: twoWeeksAgo,
            },
            userId: user.id,
          },
        })
      )._sum.reviewsStudied ?? 0;

    // ...or if the user's account was created in the week before those two weeks
    const createdInWeekBefore =
      user.createdAt.getTime() <= twoWeeksAgo.getTime() &&
      user.createdAt.getTime() >= threeWeeksAgo.getTime();

    if (createdInWeekBefore || (await reviewsStudiedBefore()) > 0) {
      sendEmail({
        to: user.email,
        subject: "Still Interested in Alu?",
        html: template({
          title: "Still Interested in Alu?",
        }),
      });
      sentToUsers.push(user.id)
    }
  }

  // Note that a re-engagement email was sent to all of these users,
  // so we won't send them another for a long while
  await prisma.user.updateMany({
    where: {
      id: {
        in: sentToUsers,
      }
    },
    data :{
      sentReengagement: new Date(),
    }
  })
};

export default sendReengagement;
