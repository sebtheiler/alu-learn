import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Flashcards: NextPage = (props: FlashcardsPageProps) => (
  <FlashcardsPage {...props} />
);

export default Flashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;
  const flashcards = await prisma.flashcard.findMany({
    where: {
      subSection: {
        courseSection: {
          courseId: courseId as string,
        },
      },
    },
  });

  return {
    props: {
      courseId,
      flashcards,
    } as FlashcardsPageProps,
  };
};
