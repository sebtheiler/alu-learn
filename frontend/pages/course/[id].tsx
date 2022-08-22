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
  const course = await prisma.course.findUnique({
    where: {
      id: id as string,
    },
  });

  return {
    props: {
      course: course,
      session,
      streak,
    } as CoursePageProps,
  };
};
