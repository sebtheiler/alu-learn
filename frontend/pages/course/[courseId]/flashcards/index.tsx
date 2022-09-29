import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import canEditCourse from "helpers/canEditCourse";
import canViewCourse from "helpers/canViewCourse";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

const Flashcards: NextPage<FlashcardsPageProps> = (
  props: FlashcardsPageProps
) => <FlashcardsPage {...props} />;

export default Flashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const course = await prisma.course.findFirst({
    where: {
      id: courseId as string,
    },
    select: {
      id: true,
      title: true,
    },
  });
  if (!course || !canViewCourse(courseId as string, session?.user?.email))
    return {
      notFound: true,
    };

  const flashcards = await prisma.flashcard.findMany({
    where: {
      courseId: courseId as string,
    },
    select: {
      id: true,
      fields: true,
      tags: true,
      type: true,
    },
    orderBy: [
      {
        subSection: {
          courseSection: {
            index: "asc",
          },
        },
      },
      {
        subSection: {
          index: "asc",
        },
      },
      {
        index: "asc",
      },
    ],
  });

  const editAccess = await canEditCourse(
    courseId as string,
    session?.user?.email
  );

  return {
    props: {
      courseId,
      title: course.title,
      flashcards,
      editAccess,
    } as FlashcardsPageProps,
  };
};
