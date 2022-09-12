import QuizGamePage from "@/pages/QuizGamePage";
import type { QuizGamePageProps } from "@/pages/QuizGamePage";
import getGameReviewInstances from "course/games";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "pages/api/auth/[...nextauth]";

const QuizGame: NextPage<QuizGamePageProps> & { authRequired: boolean } = (
  props: QuizGamePageProps
) => <QuizGamePage {...props} />;
QuizGame.authRequired = true;

export default QuizGame;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId, numQuestions, flashcardsType } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, { id: true });
  if (!session || !user) signIn();
  if (typeof numQuestions !== "string") throw new Error("Invalid grid size");

  const reviewInstances = await getGameReviewInstances({
    courseId: courseId as string,
    userId: user?.id as string,
    numReviewInstances: parseInt(numQuestions),
    flashcardsType: flashcardsType as "SEEN" | "UNSEEN" | "ALL",
  });

  return {
    props: {
      reviewInstances: JSON.parse(JSON.stringify(reviewInstances)),
    } as QuizGamePageProps,
  };
};
