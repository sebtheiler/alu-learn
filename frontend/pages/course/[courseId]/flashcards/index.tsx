import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import type { Flashcard } from "@/types";
import flashcardsSEO from "course/flashcardsSEO";
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
      title: true,
      seoDescription: true,
      seoSubject: true,
      id: true,
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

  const flashcardsHasPart = await flashcardsSEO(flashcards as Flashcard[]);

  return {
    props: {
      course,
      title: course.title,
      flashcardsHasPart,
      flashcards,
      editAccess,
    } as FlashcardsPageProps,
  };
};
