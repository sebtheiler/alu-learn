import { authOptions } from "../api/auth/[...nextauth]";
import ClassroomPage from "@/pages/ClassroomPage";
import type { ClassesPageProps } from "@/pages/ClassroomPage";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import type { NextPage } from "types";

const Classes: NextPage<ClassesPageProps> = (props: ClassesPageProps) => (
  <ClassroomPage {...props} />
);
Classes.authRequired = true;

export default Classes;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, { id: true });
  const { classroomId } = context.query;

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

  const classroom =
    (await prisma.classroom.findFirst({
      where: {
        id: classroomId as string,
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
    })) ?? null;

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

  const courseSections = classroom
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
      classrooms,
      classroom,
      students,
      assignments,
      courseSections,
    } as ClassesPageProps,
  };
};
