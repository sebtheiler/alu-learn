import CoursePage from "@/pages/CoursePage";
import type { CoursePageProps } from "@/pages/CoursePage";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import isCourseUser from "helpers/isCourseUser";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

const Course: NextPage<CoursePageProps> = (props: CoursePageProps) => (
  <CoursePage {...props} />
);

export default Course;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
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
          slug: true,
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
    } as CoursePageProps,
  };
};
