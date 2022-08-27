import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Flashcards: NextPage = (props: FlashcardsPageProps) => (
  <FlashcardsPage {...props} />
);

export default Flashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;

  return {
    props: {
      courseId,
    } as FlashcardsPageProps,
  };
};
