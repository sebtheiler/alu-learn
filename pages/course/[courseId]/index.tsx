import CoursePage from "@/pages/CoursePage";
import type { CoursePageProps } from "@/pages/CoursePage";
import canEditCourse from "helpers/canEditCourse";
import canViewCourse from "helpers/canViewCourse";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import getServerSession from "helpers/getServerSession";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";

const Course: NextPage<CoursePageProps> = (props: CoursePageProps) => (
  <CoursePage {...props} />
);

export default Course;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);
  const { courseId } = context.query;

  let course = await prisma.course.findUnique({
    where: {
      id: courseId as string,
    },
    select: {
      id: true,
      title: true,
      bannerImage: true,
      seoDescription: true,
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
  });

  const viewAccess = await canViewCourse(
    courseId as string,
    session?.user?.email
  );
  const editAccess = await canEditCourse(
    courseId as string,
    session?.user?.email
  );
  if (!viewAccess) {
    course = null;
  } else if (course && course.bannerImage) {
    course.bannerImage = generateSignedS3URL(course.bannerImage);
  }

  return {
    props: {
      course,
      viewAccess,
      editAccess,
    } as CoursePageProps,
  };
};
