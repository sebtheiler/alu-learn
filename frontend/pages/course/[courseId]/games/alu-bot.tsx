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

  const studyData = await getStudyReviewInstances(context, {
    courseId: courseId as string,
    studyAhead: false,
  });
  if (!studyData) {
    return {
      notFound: true,
    };
  }
  const { reviewInstances, intervals } = studyData;

  return {
    props: JSON.parse(
      JSON.stringify({
        reviewInstances,
        intervals,
      })
    ) as AluBotGamePageProps,
  };
};
