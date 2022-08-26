import { getSessionAndStreak } from "../../../../lib/getSessionSSR";
import type { NextPage } from "../../../../lib/types";
import type { GetServerSideProps } from "next";
import FlashcardsPage from "pages/FlashcardsPage";
import type { FlashcardsPageProps } from "pages/FlashcardsPage";

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
