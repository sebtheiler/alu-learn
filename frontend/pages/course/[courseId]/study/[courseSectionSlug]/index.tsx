import StudyFlashcardsPage from "@/pages/StudyFlashcardsPage";
import type { StudyFlashcardsPageProps } from "@/pages/StudyFlashcardsPage";
import getStudyReviewInstances from "course/study";
import type { GetServerSideProps, NextPage } from "next";

const StudyFlashcards: NextPage<StudyFlashcardsPageProps> & {
  authRequired: boolean;
} = (props: StudyFlashcardsPageProps) => <StudyFlashcardsPage {...props} />;
StudyFlashcards.authRequired = true;

export default StudyFlashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    courseId,
    courseSectionSlug,
    studyAhead: studyAheadRaw,
  } = context.query;
  const studyAhead =
    typeof studyAheadRaw === "string" && studyAheadRaw.toLowerCase() === "true";

  const { reviewInstances, intervals } = await getStudyReviewInstances(
    context,
    {
      courseId: courseId as string,
      courseSectionSlug: courseSectionSlug as string | undefined,
      studyAhead,
    }
  );

  return {
    props: JSON.parse(
      JSON.stringify({
        reviewInstances,
        intervals,
      })
    ) as StudyFlashcardsPageProps,
  };
};
