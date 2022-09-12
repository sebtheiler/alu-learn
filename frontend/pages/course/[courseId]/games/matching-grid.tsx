import MatchingGridGamePage from "@/pages/MatchingGridGamePage";
import type { MatchingGridGamePageProps } from "@/pages/MatchingGridGamePage";
import type { LearningStatus } from "@prisma/client";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "pages/api/auth/[...nextauth]";

const MatchingGridGame: NextPage<MatchingGridGamePageProps> & {
  authRequired: boolean;
} = (props: MatchingGridGamePageProps) => <MatchingGridGamePage {...props} />;
MatchingGridGame.authRequired = true;

export default MatchingGridGame;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId, gridSize, flashcardsType } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, { id: true });
  if (!session || !user) signIn();
  if (typeof gridSize !== "string") throw new Error("Invalid grid size");

  let learningStatus: object | LearningStatus | undefined = undefined;
  if (flashcardsType === "SEEN")
    learningStatus = {
      not: "UNSEEN",
    };
  else if (flashcardsType === "UNSEEN") learningStatus = "UNSEEN";

  console.log(parseInt(gridSize) ** 2 / 2);
  const reviewInstancesSelect = {
    userId: user?.id,
    flashcard: {
      courseId: courseId as string,
      type: "NORMAL",
    },
    learningStatus,
  };
  const reviewInstancesCount = await prisma.reviewInstance.count({
    where: reviewInstancesSelect,
  });
  const skip = Math.max(
    Math.floor(Math.random() * reviewInstancesCount) - reviewInstancesCount,
    0
  );
  const reviewInstances = await prisma.reviewInstance.findMany({
    where: reviewInstancesSelect,
    take: parseInt(gridSize) ** 2 / 2,
    skip,
    select: {
      id: true,
      flashcard: {
        select: {
          fields: true,
        },
      },
    },
  });

  return {
    props: {
      reviewInstances: JSON.parse(JSON.stringify(reviewInstances)),
    } as MatchingGridGamePageProps,
  };
};
