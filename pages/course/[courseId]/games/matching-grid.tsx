import MatchingGridGamePage from "@/pages/MatchingGridGamePage";
import type { MatchingGridGamePageProps } from "@/pages/MatchingGridGamePage";
import getGameReviewInstances from "course/games";
import getAuthServerSession from "helpers/getAuthServerSession";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps } from "next";
import { signIn } from "next-auth/react";
import type { NextPage } from "types";

const MatchingGridGame: NextPage<MatchingGridGamePageProps> = (
  props: MatchingGridGamePageProps
) => <MatchingGridGamePage {...props} />;
MatchingGridGame.authRequired = true;
MatchingGridGame.proRequired = true;

export default MatchingGridGame;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId, gridSize, flashcardsType } = context.query;
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;
  const user = await getUserSSR(session, { id: true });
  if (!session || !user) signIn();
  if (typeof gridSize !== "string") throw new Error("Invalid grid size");

  const reviewInstances = await getGameReviewInstances({
    courseId: courseId as string,
    userId: user?.id as string,
    numReviewInstances: parseInt(gridSize) ** 2 / 2,
    flashcardsType: flashcardsType as "SEEN" | "UNSEEN" | "ALL",
  });

  return {
    props: {
      reviewInstances: JSON.parse(JSON.stringify(reviewInstances)),
    } as MatchingGridGamePageProps,
  };
};
