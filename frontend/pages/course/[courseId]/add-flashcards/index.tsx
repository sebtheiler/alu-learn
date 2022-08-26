import { getSessionAndStreak } from "helpers/getSessionSSR";
import isCourseUser from "helpers/isCourseUser";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Blank: NextPage = () => <></>;
export default Blank;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session } = await getSessionAndStreak(context);
  const { courseId } = context.query;

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
