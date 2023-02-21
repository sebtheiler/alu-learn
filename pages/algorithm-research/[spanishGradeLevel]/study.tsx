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
  const { spanishGradeLevel } = context.query;
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const course = await prisma.course.findFirstOrThrow({
    where: {
      algorithmResearchSpanishLevel: spanishGradeLevel as string,
    },
    select: {
      id: true,
      title: true,
      privacySetting: true,
    },
  });

  const studyData = await getStudyReviewInstances(context, {
    session,
    courseId: course.id,
    studyAhead: false,
    algorithmResearchGroup: spanishGradeLevel as "ap-spanish" | "spanish-iii",
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
        title: course?.title,
        intervals,
        isSharedCourse: false,
      })
    ) as StudyFlashcardsPageProps,
  };
};
