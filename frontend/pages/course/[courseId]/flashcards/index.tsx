import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";

const Flashcards: NextPage<FlashcardsPageProps> = (
  props: FlashcardsPageProps
) => <FlashcardsPage {...props} />;

export default Flashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;
  const flashcards = await prisma.flashcard.findMany({
    where: {
      courseId: courseId as string,
    },
    select: {
      id: true,
      fields: true,
      tags: true,
      type: true,
    },
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

  return {
    props: {
      courseId,
      flashcards,
    } as FlashcardsPageProps,
  };
};
