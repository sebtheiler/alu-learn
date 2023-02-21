import getServerSession from "helpers/getServerSession";
import isCourseOwner from "helpers/isCourseOwner";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Blank: NextPage = () => <></>;
export default Blank;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId, courseSectionSlug } = context.query;
  const session = await getServerSession(context);

  // Redirect the user if they are not a user of the course or the
  // course section does not exist in the given course
  const courseRedirect = {
    redirect: {
      permanent: false,
      destination: `/course/${courseId}`,
    },
  };
  if (
    !isCourseOwner(courseId as string, session?.user?.email) ||
    !prisma.courseSection.findFirst({
      where: {
        slug: courseSectionSlug as string,
        courseId: courseId as string,
      },
    })
  ) {
    return courseRedirect;
  }

  const subSection = await prisma.subSection.findFirst({
    where: {
      courseSection: {
        slug: courseSectionSlug as string,
        courseId: courseId as string,
      },
    },
    select: {
      slug: true,
    },
  });

  return {
    redirect: {
      permanent: false,
      destination: `/course/${courseId}/add-flashcards/${courseSectionSlug}/${subSection?.slug}`,
    },
  };
};
