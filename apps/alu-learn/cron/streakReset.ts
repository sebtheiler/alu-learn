import prisma from "lib/prisma";

/**
 * Reset streaks for users who haven't studied.
 * Run hourly to account for different timezones
 */
const streakReset = async () => {
  const utcHour = new Date().getUTCHours(); // reset at midnight
  const timezoneOffset = utcHour < 12 ? utcHour * 60 : (utcHour - 24) * 60;

  // Reset streaks to 0 for users who haven't studied
  await prisma.user.updateMany({
    where: {
      doneReviewsToday: false,
      currentStreak: {
        gt: 0,
      },
      timezoneOffset,
    },
    data: {
      currentStreak: 0,
    },
  });

  // No users have studied yet today
  await prisma.user.updateMany({
    where: {
      timezoneOffset,
    },
    data: {
      doneReviewsToday: false,
      numReviewsDoneToday: 0,
    },
  });
};

export default streakReset;
