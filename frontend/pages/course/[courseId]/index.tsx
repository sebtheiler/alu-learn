import generateSignedS3URL from "../../../lib/generateSignedS3URL";
import { getSessionAndStreak } from "../../../lib/getSessionSSR";
import isCourseUser from "../../../lib/isCourseUser";
import prisma from "../../../lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import CoursePage from "pages/CoursePage";
import type { CoursePageProps } from "pages/CoursePage";

const Course: NextPage<CoursePageProps> = (props: CoursePageProps) => (
  <CoursePage {...props} />
);

export default Course;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, streak } = await getSessionAndStreak(context);
  const { courseId } = context.query;

  let course = await prisma.course.findUnique({
    where: {
      id: courseId as string,
    },
    select: {
      id: true,
      title: true,
      bannerImage: true,
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

  let authorized = true;
  if (!(await isCourseUser(courseId as string, session?.user?.email))) {
    course = null;
    authorized = false;
  } else if (course && course.bannerImage) {
    course.bannerImage = generateSignedS3URL(course.bannerImage);
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
