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
  const { assignmentId, studyAhead: studyAheadRaw } = context.query;
  const studyAhead =
    typeof studyAheadRaw === "string" && studyAheadRaw.toLowerCase() === "true";

  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId as string,
      classrooms: {
        some: {
          OR: [
            {
              students: {
                some: {
                  email: session.user?.email,
                },
              },
            },
            {
              teachers: {
                some: {
                  email: session.user?.email,
                },
              },
            },
          ],
        },
      },
    },
    select: {
      id: true,
      title: true,
      classrooms: {
        select: {
          id: true,
          courseId: true,
        },
      },
      assignedSubSections: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!assignment) {
    return {
      notFound: true,
    };
  }

  const courseId = assignment.classrooms[0].courseId;
  const subSectionIds = assignment.assignedSubSections.map(
    (subSection) => subSection.id
  );

  const studyData = await getStudyReviewInstances(context, {
    session,
    courseId: courseId as string,
    studyAhead,
    subSectionIds,
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
