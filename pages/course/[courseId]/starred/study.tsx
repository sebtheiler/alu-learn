import StudyFlashcardsPage from "@/pages/StudyFlashcardsPage";
import type { StudyFlashcardsPageProps } from "@/pages/StudyFlashcardsPage";
import getStudyReviewInstances from "course/study";
import getAuthServerSession from "helpers/getAuthServerSession";
import prisma from "lib/prisma";
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

  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const studyData = await getStudyReviewInstances(context, {
    session,
    courseId: courseId as string,
    studyAhead,
    starredOnly: true,
  });
  if (!studyData) {
    return {
      notFound: true,
    };
  }
  const { reviewInstances, intervals } = studyData;

  const course = await prisma.course.findUnique({
    where: { id: courseId as string },
    select: { title: true, privacySetting: true },
  });

  return {
    props: JSON.parse(
      JSON.stringify({
        reviewInstances,
        title: course?.title,
        intervals,
        isSharedCourse: course?.privacySetting !== "PRIVATE",
      })
    ) as StudyFlashcardsPageProps,
  };
};
