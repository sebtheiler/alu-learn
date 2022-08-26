import { getSessionAndStreak } from "../../../../../lib/getSessionSSR";
import isCourseUser from "../../../../../lib/isCourseUser";
import prisma from "../../../../../lib/prisma";
import type { NextPage } from "../../../../../lib/types";
import { cleanTitle } from "helpers/cleanTitle";
import type { GetServerSideProps } from "next";

const Blank: NextPage = () => <></>;
export default Blank;

// TODO: rewrite this
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
      // Should be course section, not course
      courseSection: {
        courseId: courseId as string,
      },
    },
    select: {
      title: true,
      courseSection: {
        select: {
          title: true,
        },
      },
    },
  });

  return {
    redirect: {
      permanent: false,
      destination: `/course/${courseId}/add-flashcards/${cleanTitle(
        subSection?.courseSection.title
      )}/${cleanTitle(subSection?.title)}`,
    },
  };
};
