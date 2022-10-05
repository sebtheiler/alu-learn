import processCloze from "./processCloze";
import { clozeRegex } from "@/globals";
import { ClozeColor } from "@/editor/plugins/ClozeDeletionPlugin/colors";
import type { Intervals } from "@/types";
import type { Flashcard, FlashcardType, ReviewInstance } from "@prisma/client";
import cuid from "cuid";
import calculateInterval from "helpers/calculateInterval";
import canViewCourse from "helpers/canViewCourse";
import getUserSSR from "helpers/getUserSSR";
import isCourseUser from "helpers/isCourseUser";
import prisma from "lib/prisma";
import type { GetServerSidePropsContext } from "next";
import type { Session } from "next-auth";

interface PartialReviewInstance {
  flashcardId: string;
  userId: string;
  nextReview: Date;
  id: string;
}

/**
 * The number of unique reviews that the user sees in a given study session
 */
const NUM_FLASHCARDS_PER_SESSION = 20;

/**
 * Fields to select when fetching flashcards
 */
const flashcardSelect = {
  fields: true,
  tags: true,
  type: true,
};

/**
 * Fields to select when fetching reviews
 */
const reviewInstanceSelect = {
  id: true,
  name: true,
  learningStatus: true,
  stepsIndex: true,
  ease: true,
  nextReview: true,
  lastReview: true,
  isStarred: true,
  flashcard: {
    select: flashcardSelect,
  },
};

/**
 * Create review instances for a flashcard
 * @param flashcard Flashcard to create review instances for
 * @param userId User who will own the review instances
 * @returns A list of review instances to be created
 */
const generateReviewInstances = async (
  flashcard: Partial<Flashcard> & { type: FlashcardType; id: string },
  userId: string
): Promise<PartialReviewInstance[]> => {
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
    case "CLOZE": {
      const field = JSON.stringify(JSON.parse(flashcard.fields as string)[0]);

      // Process modern cloze colors
      const clozeColors = new Set<ClozeColor>();
      processCloze(field, (child) => clozeColors.add(child.getColor()));

      // Process legacy cloze numbers
      const clozeNumbers = new Set<string>(); // string representation of ints
      const clozeNumberMatches = field.matchAll(clozeRegex);
      for (const clozeNumberMatch of clozeNumberMatches) {
        const clozeData = clozeNumberMatch[0]; // e.g., {{c1::hello world}}
        const clozeNumberData = clozeData.split("::")[0]; // e.g., {{c1
        const clozeNumber = clozeNumberData.replace(/^\D+/g, ""); // e.g., 1
        clozeNumbers.add(clozeNumber);
      }

      const clozeElements = new Set([...clozeColors, ...clozeNumbers]);
      return Array.from(clozeElements).map((color) => ({
        flashcardId: flashcard.id,
        userId,
        nextReview: thisMorning,
        id: cuid(),
        name: `cloze-${color.toLowerCase()}`,
      }));
    }
    default:
      throw new Error(`Unrecognized flashcard type: ${flashcard.type}`);
  }
};

/**
 * Get review instances and their intervals for studying
 * @returns The review instances and their intervals
 */
const getStudyReviewInstances = async (
  context: GetServerSidePropsContext,
  {
    session,
    courseId,
    courseSectionSlug,
    subSectionSlug,
    subSectionIds,
    studyAhead,
  }: {
    /**
     * Session
     */
    session: Session;
    /**
     * ID of the course to study (has all the flashcards)
     */
    courseId: string;
    /**
     * Slug of the course section to study
     */
    courseSectionSlug?: string;
    /**
     * Slug of the sub section to study
     */
    subSectionSlug?: string;
    /**
     * IDs of the sub sections to get flashcards from.
     * For use in assignments. Do not use when `subSectionSlug`
     * is specified.
     */
    subSectionIds?: string[];
    /**
     * Include reviews not yet due?
     */
    studyAhead: boolean;
  }
): Promise<{
  reviewInstances: Partial<ReviewInstance>[];
  intervals: Intervals;
} | null> => {
  // Check that the user is a user of the course
  if (!(await isCourseUser(courseId, session?.user?.email))) {
    // If they have access, add them as a user
    if (await canViewCourse(courseId, session?.user?.email)) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          users: {
            connect: {
              email: session?.user?.email as string,
            },
          },
        },
      });
    } else {
      // Return empty
      return null;
    }
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

  // Only get flashcards from the specific (sub)section if that (sub)section is specified
  let slugQuery = {};
  if (courseSectionSlug)
    slugQuery = {
      subSection: {
        slug: subSectionSlug,
        courseSection: {
          slug: courseSectionSlug,
        },
      },
    };
  else if (subSectionIds) {
    slugQuery = {
      subSection: {
        id: {
          in: subSectionIds,
        },
      },
    };
  }

  const user = await getUserSSR(session, { id: true });
  let reviewInstances = await prisma.reviewInstance.findMany({
    where: {
      userId: user?.id as string,
      nextReview: dateCutoff,
      flashcard: {
        courseId: courseId as string,
        ...slugQuery,
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
        ...slugQuery,
        reviewInstances: {
          // Where there are no review instances that belong to this user
          none: {
            userId: user?.id,
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
      orderBy: [
        {
          subSection: {
            courseSection: {
              index: "asc",
            },
          },
        },
        {
          subSection: {
            index: "asc",
          },
        },
        {
          index: "asc",
        },
      ],
    });

    let reviewInstancesToCreate: PartialReviewInstance[] = [];
    for (const flashcard of flashcards) {
      const generatedReviewInstances = await generateReviewInstances(
        flashcard,
        user?.id as string
      );
      reviewInstancesToCreate = reviewInstancesToCreate.concat(
        generatedReviewInstances
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

  return { reviewInstances, intervals };
};

export default getStudyReviewInstances;
