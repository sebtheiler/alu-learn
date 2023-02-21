import AlgorithmResearchPage from "@/pages/AlgorithmResearchPage";
import type { AlgorithmResearchPageProps } from "@/pages/AlgorithmResearchPage";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const AlgorithmResearch: NextPage<AlgorithmResearchPageProps> = (
  props: AlgorithmResearchPageProps
) => <AlgorithmResearchPage {...props} />;
AlgorithmResearch.authRequired = true;

export default AlgorithmResearch;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);
  const user = await getUserSSR(session, {
    id: true,
    dayChosenForAlgorithmResearch: true,
  });

  if (!!user && !user?.dayChosenForAlgorithmResearch) {
    const now = new Date();

    user.dayChosenForAlgorithmResearch = now;
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        dayChosenForAlgorithmResearch: now,
      },
    });
  }

  return {
    props: {
      dayChosenForAlgorithmResearch: JSON.stringify(
        user?.dayChosenForAlgorithmResearch
      ),
    } as AlgorithmResearchPageProps,
  };
};
