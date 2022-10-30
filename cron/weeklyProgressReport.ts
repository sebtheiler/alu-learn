import formatTimeTaken from "@/helpers/formatTimeTaken";
import createEmailTemplate from "emails/createEmailTemplate";
import sendEmail from "emails/sendEmail";
import prisma from "lib/prisma";
import nunjucks from "nunjucks";

const sendWeeklyProgressReport = async () => {
  const template = createEmailTemplate("weeklyProgressReport");
  const users = await prisma.user.findMany({
    where: {
      sendWeeklyReports: true,
      unsubscribeAll: false,
      userType: "STUDENT",
    },
    select: {
      id: true,
      email: true,
    },
  });

  const weekAgo = new Date();
  const twoWeeksAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  for (const user of users) {
    if (!user.email) continue;

    const { _sum: thisWeekData } = await prisma.historySegment.aggregate({
      _sum: {
        timeTaken: true,
        reviewsStudied: true,
      },
      where: {
        date: {
          gte: weekAgo,
        },
        userId: user.id,
      },
    });
    const thisWeekFlashcards = thisWeekData.reviewsStudied ?? 0;
    const thisWeekTime = thisWeekData.timeTaken ?? 0;
    if (thisWeekFlashcards === 0) continue;

    const { _sum: lastWeekData } = await prisma.historySegment.aggregate({
      _sum: {
        timeTaken: true,
        reviewsStudied: true,
      },
      where: {
        date: {
          gte: twoWeeksAgo,
          lt: weekAgo,
        },
        userId: user.id,
      },
    });
    const lastWeekFlashcards = lastWeekData.reviewsStudied ?? 0;
    const lastWeekTime = lastWeekData.timeTaken ?? 0;

    const context = {
      title: "Your Weekly Progress Report",
      thisWeekFlashcards,
      thisWeekTime: formatTimeTaken(thisWeekTime),
      lastWeekFlashcards,
      lastWeekTime: formatTimeTaken(lastWeekTime),
      percentImprovement:
        lastWeekFlashcards > 0
          ? Math.round((thisWeekFlashcards / lastWeekFlashcards - 1) * 100)
          : 0,
    };

    sendEmail({
      to: user.email,
      subject: "Your Weekly Progress Report",
      html: nunjucks.renderString(template(context), context),
    });
  }
};

export default sendWeeklyProgressReport;
