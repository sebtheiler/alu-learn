import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import { getSessionAndStreak } from "helpers/getSessionSSR";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Flashcards: NextPage = (props: FlashcardsPageProps) => (
  <FlashcardsPage {...props} />
);

export default Flashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, streak } = await getSessionAndStreak(context);
  const { courseId } = context.query;

  return {
    props: {
      session,
      streak,
      courseId,
    } as FlashcardsPageProps,
  };
};
