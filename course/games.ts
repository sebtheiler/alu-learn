import type { LearningStatus } from "@prisma/client";
import prisma from "lib/prisma";

const getGameReviewInstances = async ({
  courseId,
  flashcardsType,
  numReviewInstances,
  userId,
}: {
  /**
   * ID of the course to get review instances from
   */
  courseId: string;
  /**
   * ID of the user who owns the review instances (and is playing the game)
   */
  userId: string;
  /**
   * Number of review instances to fetch
   */
  numReviewInstances: number;
  /**
   * What type of review instances to fetch
   */
  flashcardsType: "SEEN" | "UNSEEN" | "ALL";
}) => {
  let learningStatus: object | LearningStatus | undefined = undefined;
  if (flashcardsType === "SEEN")
    learningStatus = {
      not: "UNSEEN",
    };
  else if (flashcardsType === "UNSEEN") learningStatus = "UNSEEN";

  const reviewInstancesSelect = {
    userId: userId,
    flashcard: {
      courseId: courseId as string,
      type: "NORMAL",
    },
    learningStatus,
  };
  const reviewInstancesCount = await prisma.reviewInstance.count({
    // @ts-ignore
    where: reviewInstancesSelect,
  });
  const skip = Math.max(
    Math.floor(Math.random() * reviewInstancesCount) - reviewInstancesCount,
    0
  );
  return prisma.reviewInstance.findMany({
    // @ts-ignore
    where: reviewInstancesSelect,
    take: numReviewInstances,
    skip,
    select: {
      id: true,
      flashcard: {
        select: {
          fields: true,
        },
      },
    },
  });
};

export default getGameReviewInstances;
