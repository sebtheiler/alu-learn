import StudyFlashcardsPage from "@/pages/StudyFlashcardsPage";
import type { StudyFlashcardsPageProps } from "@/pages/StudyFlashcardsPage";
import getStudyReviewInstances from "course/study";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import type { NextPage } from "types";

const StudyFlashcards: NextPage<StudyFlashcardsPageProps> = (
  props: StudyFlashcardsPageProps
) => <StudyFlashcardsPage {...props} />;
StudyFlashcards.authRequired = true;

export default StudyFlashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { assignmentId, studyAhead: studyAheadRaw } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const studyAhead =
    typeof studyAheadRaw === "string" && studyAheadRaw.toLowerCase() === "true";

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId as string,
      classrooms: {
        some: {
          OR: [
            {
              students: {
                some: {
                  email: session?.user?.email,
                },
              },
            },
            {
              teachers: {
                some: {
                  email: session?.user?.email,
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

  const { reviewInstances, intervals } = await getStudyReviewInstances(
    context,
    { courseId: courseId as string, studyAhead, subSectionIds }
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
