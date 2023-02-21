import AssignmentPage from "@/pages/AssignmentPage";
import type {
  AssignmentPageProps,
  StudentProgress,
} from "@/pages/AssignmentPage/AssignmentPage";
import type { User } from "@/types";
import getAuthServerSession from "helpers/getAuthServerSession";
import getLastName from "helpers-lib/src/getLastName";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Assignment: NextPage<AssignmentPageProps> = (
  props: AssignmentPageProps
) => <AssignmentPage {...props} />;
Assignment.authRequired = true;

export default Assignment;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { classroomId, assignmentId } = context.query;
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const user = await getUserSSR(session, { id: true });

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId as string,
      classrooms: {
        some: {
          teachers: {
            some: {
              id: user?.id,
            },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      essentialOnly: true,
      classrooms: {
        select: {
          id: true,
          title: true,
        },
      },
      assignedSubSections: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  if (!assignment)
    return {
      notFound: true,
    };

  const students = await prisma.user.findMany({
    where: {
      classesEnrolledIn: {
        some: {
          id: classroomId as string,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  const assignedSubSectionIds = assignment.assignedSubSections.map(
    (subSection) => subSection.id
  );
  const numFlashcards = await prisma.flashcard.count({
    where: {
      subSectionId: {
        in: assignedSubSectionIds,
      },
      tags: assignment.essentialOnly
        ? {
            contains: "essential",
          }
        : undefined,
    },
  });

  const studentProgressUnsorted: StudentProgress[] = await Promise.all(
    students.map(async (student) => {
      const numReviewInstancesStudied = await prisma.reviewInstance.count({
        where: {
          userId: student.id,
          learningStatus: {
            not: "UNSEEN",
          },
          flashcard: {
            subSection: {
              id: {
                in: assignedSubSectionIds,
              },
            },
          },
        },
      });

      const reviewInstanceHistories =
        await prisma.reviewInstanceHistory.findMany({
          where: {
            reviewInstance: {
              flashcard: {
                subSectionId: {
                  in: assignedSubSectionIds,
                },
              },
              userId: student.id,
            },
          },
          select: {
            timeTaken: true,
          },
        });
      const timeTaken = reviewInstanceHistories.reduce(
        (partialSum, rih) => partialSum + rih.timeTaken,
        0
      );

      return {
        student: student as User,
        percentComplete:
          numFlashcards > 0
            ? Math.min(numReviewInstancesStudied / numFlashcards, 1)
            : 0,
        timeTaken,
      };
    })
  );

  const studentProgress = studentProgressUnsorted.sort(
    (a, b) =>
      getLastName(a.student.name ?? "z")?.localeCompare(
        getLastName(b.student.name ?? "z")
      ) ?? 0
  );

  return {
    props: {
      classroomId,
      assignment,
      studentProgress,
    } as AssignmentPageProps,
  };
};
