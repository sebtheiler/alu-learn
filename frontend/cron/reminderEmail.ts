import createEmailTemplate from "emails/createEmailTemplate";
import sendEmail from "emails/sendEmail";
import prisma from "lib/prisma";

/**
 * Send a reminder emails to users who will lose their streaks tonight if they don't study
 */
const reminderEmail = async () => {
  const utcHour = new Date().getUTCHours() + 6; // Send at 18:00 (6:00 PM)
  const timezoneOffset = utcHour < 12 ? utcHour * 60 : (utcHour - 24) * 60;

  const template = createEmailTemplate("emails/reminder");
  const users = await prisma.user.findMany({
    where: {
      sendReminders: true,
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
      name: user.name?.split(" ")[0],
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
