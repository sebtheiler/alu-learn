import StudyFlashcardsPage from "@/pages/StudyFlashcardsPage";
import type { StudyFlashcardsPageProps } from "@/pages/StudyFlashcardsPage";
import type { Flashcard, FlashcardType } from "@prisma/client";
import cuid from "cuid";
import calculateInterval from "helpers/calculateInterval";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "pages/api/auth/[...nextauth]";

const StudyFlashcards: NextPage<StudyFlashcardsPageProps> & {
  authRequired: boolean;
} = (props: StudyFlashcardsPageProps) => <StudyFlashcardsPage {...props} />;
StudyFlashcards.authRequired = true;

export default StudyFlashcards;

interface PartialReviewInstance {
  flashcardId: string;
  userId: string;
  nextReview: Date;
  id: string;
}

const NUM_FLASHCARDS_PER_SESSION = 20;

const flashcardSelect = {
  fields: true,
  tags: true,
};
const reviewInstanceSelect = {
  id: true,
  learningStatus: true,
  stepsIndex: true,
  ease: true,
  nextReview: true,
  lastReview: true,
  flashcard: {
    select: flashcardSelect,
  },
};

const generateReviewInstances = (
  flashcard: Partial<Flashcard> & { type: FlashcardType; id: string },
  userId: string
): PartialReviewInstance[] => {
  const thisMorning = new Date();
  thisMorning.setUTCHours(0, 0, 0, 0);

  switch (flashcard.type) {
    case "NORMAL":
      return [
        {
          flashcardId: flashcard.id,
          userId,
          nextReview: thisMorning,
          id: cuid(),
        },
      ];
    case "CLOZE":
      // TODO
      return [];
    default:
      throw new Error(`Unrecognized flashcard type: ${flashcard.type}`);
  }
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId, studyAhead: studyAheadRaw } = context.query;
  const studyAhead =
    typeof studyAheadRaw === "string" && studyAheadRaw.toLowerCase() === "true";

  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    signIn();
  }

  let dateCutoff: { lte: Date } | undefined = undefined;
  // TODO: implement better studying ahead https://github.com/roxgib/anki-smarter-study-ahead
  if (!studyAhead) {
    // If not studying ahead, only show flashcards from before
    // the end of the day
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    dateCutoff = {
      lte: endOfDay,
    };
  }

  const user = await getUserSSR(session, { id: true });
  let reviewInstances = await prisma.reviewInstance.findMany({
    where: {
      userId: user?.id as string,
      nextReview: dateCutoff,
      flashcard: {
        courseId: courseId as string,
      },
    },
    select: reviewInstanceSelect,
    orderBy: {
      nextReview: "asc",
    },
    take: NUM_FLASHCARDS_PER_SESSION,
  });

  // If there are less review instances due than the number of
  // review instances that should be per session, find unseen
  // flashcards and create review instances from them.
  if (reviewInstances.length < NUM_FLASHCARDS_PER_SESSION) {
    const numFlashcardsToFetch =
      NUM_FLASHCARDS_PER_SESSION - reviewInstances.length;
    const flashcards = await prisma.flashcard.findMany({
      where: {
        courseId: courseId as string,
        reviewInstances: {
          // Where there are no review instances
          none: {
            ease: {
              gte: 0, // always false
            },
          },
        },
      },
      select: {
        fields: true,
        tags: true,
        type: true,
        id: true,
      },
      take: numFlashcardsToFetch,
    });

    let reviewInstancesToCreate: PartialReviewInstance[] = [];
    for (const flashcard of flashcards) {
      reviewInstancesToCreate = reviewInstancesToCreate.concat(
        generateReviewInstances(flashcard, user?.id as string)
      );
    }

    await prisma.reviewInstance.createMany({
      data: reviewInstancesToCreate,
    });

    const newReviewInstances = await prisma.reviewInstance.findMany({
      where: {
        id: {
          in: reviewInstancesToCreate.map((ri) => ri.id),
        },
      },
      select: reviewInstanceSelect,
      take: numFlashcardsToFetch,
    });

    reviewInstances = reviewInstances.concat(newReviewInstances);
  }

  const intervals = {};
  for (const reviewInstance of reviewInstances) {
    intervals[reviewInstance.id] = {
      AGAIN: calculateInterval(reviewInstance, "AGAIN"),
      HARD: calculateInterval(reviewInstance, "HARD"),
      GOOD: calculateInterval(reviewInstance, "GOOD"),
      EASY: calculateInterval(reviewInstance, "EASY"),
    };
  }

  return {
    props: JSON.parse(
      JSON.stringify({
        reviewInstances,
        intervals,
      })
    ) as StudyFlashcardsPageProps,
  };
};
