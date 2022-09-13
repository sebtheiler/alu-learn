import AluBotGamePage from "@/pages/AluBotGamePage";
import type { AluBotGamePageProps } from "@/pages/AluBotGamePage";
import getStudyReviewInstances from "course/study";
import type { GetServerSideProps, NextPage } from "next";

const AluBotGame: NextPage<AluBotGamePageProps> & { authRequired: boolean } = (
  props: AluBotGamePageProps
) => <AluBotGamePage {...props} />;
AluBotGame.authRequired = true;

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
