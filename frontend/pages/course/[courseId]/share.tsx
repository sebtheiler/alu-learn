import ShareCoursePage from "@/pages/ShareCoursePage";
import type { ShareCoursePageProps } from "@/pages/ShareCoursePage";
import getUserSSR from "helpers/getUserSSR";
import isCourseOwner from "helpers/isCourseOwner";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import type { NextPage } from "types";

const ShareCourse: NextPage<ShareCoursePageProps> = (
  props: ShareCoursePageProps
) => <ShareCoursePage {...props} />;
ShareCourse.authRequired = true;

export default ShareCourse;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, { email: true, id: true });

  const course = await prisma.course.findUnique({
    where: {
      id: (courseId as string | undefined) ?? "",
    },
    select: {
      id: true,
      title: true,
      privacySetting: true,
      editingAccess: true,
      description: true,
      owners: {
        select: {
          id: true,
          username: true,
          image: true,
          name: true,
        },
      },
    },
  });

  const authorized =
    course && (await isCourseOwner(courseId as string, user?.email));

  return {
    props: {
      course: authorized ? course : null,
      authorized,
      currentUserId: user?.id,
    } as ShareCoursePageProps,
  };
};
