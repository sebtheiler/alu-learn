import AluBotGamePage from "@/pages/AluBotGamePage";
import type { AluBotGamePageProps } from "@/pages/AluBotGamePage";
import getStudyReviewInstances from "course/study";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const AluBotGame: NextPage<AluBotGamePageProps> = (
  props: AluBotGamePageProps
) => <AluBotGamePage {...props} />;
AluBotGame.authRequired = true;
AluBotGame.proRequired = true;

export default AluBotGame;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;

  const { reviewInstances, intervals } = await getStudyReviewInstances(
    context,
    { courseId: courseId as string, studyAhead: false }
  );

  return {
    props: JSON.parse(
      JSON.stringify({
        reviewInstances,
        intervals,
      })
    ) as AluBotGamePageProps,
  };
};
