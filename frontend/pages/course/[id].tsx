import { getSessionAndStreak } from "../../lib/getSessionSSR";
import prisma from "../../lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import CoursePage from "pages/CoursePage";
import type { CoursePageProps } from "pages/CoursePage";

const Course: NextPage<CoursePageProps> = (props: CoursePageProps) => (
  <CoursePage {...props} />
);

export default Course;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, streak } = await getSessionAndStreak(context);
  const { id } = context.query;

  let course = await prisma.course.findUnique({
    where: {
      id: id as string,
    },
    select: {
      id: true,
      title: true,
      imageBanner: true,
      courseSections: {
        select: {
          id: true,
          title: true,
          subSections: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  const isCourseUser =
    (await prisma.user.count({
      where: {
        email: session?.user?.email ?? null,
        courses: {
          some: {
            id: course?.id ?? "",
          },
        },
      },
    })) > 0;

  let authorized = true;
  if (!isCourseUser) {
    course = null;
    authorized = false;
  }

  return {
    props: {
      course,
      authorized,
      session,
      streak,
    } as CoursePageProps,
  };
};
