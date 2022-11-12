import getServerSession from "helpers/getServerSession";
import isCourseOwner from "helpers/isCourseOwner";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Blank: NextPage = () => <></>;
export default Blank;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);
  const { courseId } = context.query;

  if (!isCourseOwner(courseId as string, session?.user?.email)) {
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
