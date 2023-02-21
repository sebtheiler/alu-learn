import StudentClassroomPage from "@/pages/StudentClassroomPage";
import type { StudentClassroomPageProps } from "@/pages/StudentClassroomPage";
import TeacherClassroomPage from "@/pages/TeacherClassroomPage";
import type { TeacherClassroomPageProps } from "@/pages/TeacherClassroomPage";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import getAuthServerSession from "helpers/getAuthServerSession";
import getLastName from "helpers/getLastName";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

type ClassroomPageProps =
  | {
      teacher: true;
      props: TeacherClassroomPageProps;
    }
  | {
      teacher: false;
      props: StudentClassroomPageProps;
    };

const Classes: NextPage<ClassroomPageProps> = (props) =>
  props.teacher ? (
    <TeacherClassroomPage {...props.props} />
  ) : (
    <StudentClassroomPage {...props.props} />
  );
Classes.authRequired = true;

export default Classes;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;
  const user = await getUserSSR(session, { id: true, userType: true });
  const { classroomId } = context.query;

  const classroom =
    (await prisma.classroom.findFirst({
      where: {
        id: classroomId as string,
        AND: {
          OR: [
            {
              teachers: {
                some: {
                  id: user?.id as string,
                },
              },
            },
            {
              students: {
                some: {
                  id: user?.id as string,
                },
              },
            },
          ],
        },
      },
      select: {
        id: true,
        title: true,
        courseId: true,
        joinCode: true,
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })) ?? null;

  const assignments = classroom
    ? await prisma.assignment.findMany({
        where: {
          classrooms: {
            some: {
              id: classroomId as string,
            },
          },
        },
        select: {
          id: true,
          title: true,
          essentialOnly: true,
          assignedSubSections: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      })
    : [];

  if (user?.userType === "TEACHER" || user?.userType === "MIXED") {
    const classrooms = await prisma.classroom.findMany({
      where: {
        teachers: {
          some: {
            id: user?.id as string,
          },
        },
      },
      select: {
        id: true,
        title: true,
        courseId: true,
      },
    });

    const studentsUnsorted = classroom
      ? await prisma.user.findMany({
          where: {
            classesEnrolledIn: {
              some: {
                id: classroom.id,
              },
            },
          },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            email: true,
            history: {
              where: {
                date: new Date(),
              },
              select: {
                reviewsStudied: true,
                timeTaken: true,
              },
            },
          },
        })
      : [];

    const students = studentsUnsorted.sort(
      (a, b) =>
        getLastName(a.name ?? "z")?.localeCompare(getLastName(b.name ?? "z")) ??
        0
    );

    const courseSections =
      classroom && classroom.courseId
        ? await prisma.courseSection.findMany({
            where: {
              courseId: classroom.courseId,
            },
            select: {
              id: true,
              title: true,
              subSections: {
                select: {
                  id: true,
                  title: true,
                },
                orderBy: {
                  index: "asc",
                },
              },
            },
            orderBy: {
              index: "asc",
            },
          })
        : [];

    return {
      props: {
        teacher: true,
        props: {
          classrooms,
          classroom,
          students,
          assignments,
          courseSections,
        } as TeacherClassroomPageProps,
      },
    };
  } else {
    const course =
      classroom && classroom.courseId
        ? await prisma.course.findUnique({
            where: {
              id: classroom.courseId,
            },
            select: {
              id: true,
              title: true,
              bannerImage: true,
              courseSections: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  color: true,
                  subSections: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                    },
                    orderBy: {
                      index: "asc",
                    },
                  },
                },
                orderBy: {
                  index: "asc",
                },
              },
            },
          })
        : null;

    if (course && course.bannerImage)
      course.bannerImage = generateSignedS3URL(course.bannerImage);

    const assignmentsPercentComplete = {};
    for (const assignment of assignments) {
      const flashcardWhere = {
        subSectionId: {
          in: assignment.assignedSubSections.map((ss) => ss.id),
        },
        tags: assignment.essentialOnly
          ? {
              contains: "essential",
            }
          : undefined,
      };

      const numFlashcards = await prisma.flashcard.count({
        where: flashcardWhere,
      });
      const numReviewInstancesStudied = await prisma.reviewInstance.count({
        where: {
          userId: user?.id,
          learningStatus: {
            not: "UNSEEN",
          },
          flashcard: flashcardWhere,
        },
      });

      assignmentsPercentComplete[assignment.id] =
        numReviewInstancesStudied / numFlashcards;
    }

    return {
      props: {
        teacher: false,
        props: {
          classroom,
          course,
          assignments,
          assignmentsPercentComplete,
        } as StudentClassroomPageProps,
      },
    };
  }
};
