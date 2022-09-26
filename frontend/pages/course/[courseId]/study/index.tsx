import StudyFlashcardsPage from "@/pages/StudyFlashcardsPage";
import type { StudyFlashcardsPageProps } from "@/pages/StudyFlashcardsPage";
import getStudyReviewInstances from "course/study";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const StudyFlashcards: NextPage<StudyFlashcardsPageProps> = (
  props: StudyFlashcardsPageProps
) => <StudyFlashcardsPage {...props} />;
StudyFlashcards.authRequired = true;

export default StudyFlashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId, studyAhead: studyAheadRaw } = context.query;
  const studyAhead =
    typeof studyAheadRaw === "string" && studyAheadRaw.toLowerCase() === "true";

  const studyData = await getStudyReviewInstances(context, {
    courseId: courseId as string,
    studyAhead,
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
    ) as StudyFlashcardsPageProps,
  };
};
