import prisma from "lib/prisma";

/**
 * Reset streaks for users who haven't studied.
 * Run hourly to account for different timezones
 */
const resetAutoFlashcards = async () => {
  await prisma.user.updateMany({
    data: {
      numAutoFlashcardsGenerated: 0,
    },
  });
};

export default resetAutoFlashcards;
