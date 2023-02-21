import AluBotGamePage from "@/pages/AluBotGamePage";
import type { AluBotGamePageProps } from "@/pages/AluBotGamePage";
import getStudyReviewInstances from "course/study";
import getAuthServerSession from "helpers/getAuthServerSession";
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

  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const studyData = await getStudyReviewInstances(context, {
    session,
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
