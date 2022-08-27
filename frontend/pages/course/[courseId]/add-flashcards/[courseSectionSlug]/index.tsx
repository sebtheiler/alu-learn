import isCourseUser from "helpers/isCourseUser";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import type { NextPage } from "types";

const Blank: NextPage = () => <></>;
export default Blank;

// TODO: rewrite this
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!isCourseUser(courseId as string, session?.user?.email)) {
    return {
      redirect: {
        permanent: false,
        destination: `/course/${courseId}`,
      },
    };
  }

  const subSection = await prisma.subSection.findFirst({
    where: {
      // Should be course section, not course
      courseSection: {
        courseId: courseId as string,
      },
    },
    select: {
      slug: true,
      courseSection: {
        select: {
          slug: true,
        },
      },
    },
  });

  return {
    redirect: {
      permanent: false,
      destination: `/course/${courseId}/add-flashcards/${subSection?.courseSection.slug}/${subSection?.slug}`,
    },
  };
};
