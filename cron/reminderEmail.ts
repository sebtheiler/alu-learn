import createEmailTemplate from "emails/createEmailTemplate";
import formatName from "emails/formatName";
import sendEmail from "emails/sendEmail";
import prisma from "lib/prisma";

/**
 * Send a reminder emails to users who will lose their streaks tonight if they don't study
 */
const reminderEmail = async () => {
  const utcHour = new Date().getUTCHours() + 6; // Send at 18:00 (6:00 PM)
  const timezoneOffset = utcHour < 12 ? utcHour * 60 : (utcHour - 24) * 60;

  const template = createEmailTemplate("reminder");
  const users = await prisma.user.findMany({
    where: {
      sendReminders: true,
      unsubscribeAll: false,
      doneReviewsToday: false,
      timezoneOffset,
      currentStreak: {
        gt: 0,
      },
    },
    select: {
      name: true,
      email: true,
      currentStreak: true,
    },
  });

  for (const user of users) {
    const html = template({
      title: "Daily Study Reminder",
      name: formatName(user.name),
      streak: user.currentStreak,
      newStreak: user.currentStreak + 1,
    });

    sendEmail({
      to: user.email as string,
      subject: `Don't lose your ${user.currentStreak}-day streak!`,
      html,
    });
  }
};

export default reminderEmail;
