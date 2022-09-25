import { authOptions } from "../api/auth/[...nextauth]";
import StudentClassroomPage from "@/pages/StudentClassroomPage";
import type { StudentClassroomPageProps } from "@/pages/StudentClassroomPage";
import TeacherClassroomPage from "@/pages/TeacherClassroomPage";
import type { TeacherClassroomPageProps } from "@/pages/TeacherClassroomPage";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
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
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
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

    const students = classroom
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

    return {
      props: {
        teacher: false,
        props: {
          classroom,
          course,
          assignments,
        } as StudentClassroomPageProps,
      },
    };
  }
};
