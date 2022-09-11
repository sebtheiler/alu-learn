import type { PrismaClient, User } from "@prisma/client";

/**
 * Update's the user's history by getting or creating a history segment for the day
 * @param user The user to update the history for
 * @param timeTaken How many ms the user spent studying the review
 * @param prisma Prisma client (`ctx.prisma`)
 * @returns A DB operation to update the user's history
 */
const updateUserHistory = async (
  user: Partial<User>,
  timeTaken: number,
  prisma: PrismaClient
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const history = await prisma.historySegment.findFirst({
    where: {
      userId: user.id,
      date: today,
    },
    select: {
      id: true,
      reviewsStudied: true,
      timeTaken: true,
    },
  });
  if (history) {
    return prisma.historySegment.update({
      where: {
        id: history.id,
      },
      data: {
        reviewsStudied: history.reviewsStudied + 1,
        timeTaken: history.timeTaken + timeTaken,
      },
    });
  } else {
    return prisma.historySegment.create({
      data: {
        reviewsStudied: 1,
        timeTaken,
        date: today,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }
};

export default updateUserHistory;
