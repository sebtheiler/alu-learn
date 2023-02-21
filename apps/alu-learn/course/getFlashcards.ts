import type { Prisma } from "@prisma/client";
import prisma from "lib/prisma";

const subSectionOrder = {
  index: "asc",
};
const courseSectionOrder = [
  { subSection: { index: "asc" } },
  {
    index: "asc",
  },
];
const courseOrder = [
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
];

const getFlashcards = async ({
  courseId,
  courseSectionSlug,
  subSectionSlug,
  otherCriteria,
  pageNum,
  pageSize = 200,
}: {
  courseId: string;
  courseSectionSlug?: string;
  subSectionSlug?: string;
  /**
   * Appended to the `findMany` query
   */
  otherCriteria?: any;
  pageNum: number;
  pageSize?: number;
}) => {
  const flashcards = await prisma.flashcard.findMany({
    where: {
      courseId: courseSectionSlug ? undefined : courseId,
      subSection:
        courseSectionSlug || subSectionSlug
          ? {
              slug: subSectionSlug,
              courseSection: {
                courseId: courseId,
                slug: courseSectionSlug,
              },
            }
          : undefined,
      ...otherCriteria,
    },
    select: {
      id: true,
      fields: true,
      tags: true,
      type: true,
      courseId: true,
    },
    orderBy: (subSectionSlug
      ? subSectionOrder
      : courseSectionSlug
      ? courseSectionOrder
      : courseOrder) as Prisma.FlashcardOrderByWithRelationInput,
    skip: pageNum * pageSize,
    take: pageSize,
  });

  return flashcards;
};

export default getFlashcards;
