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
  const { courseId, courseSectionSlug } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const courseSection = await prisma.courseSection.findFirst({
    where: {
      slug: courseSectionSlug as string,
      courseId: courseId as string,
    },
    select: {
      title: true,
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  if (
    !courseSection ||
    !canViewCourse(courseId as string, session?.user?.email)
  )
    return {
      notFound: true,
    };

  const flashcards = await prisma.flashcard.findMany({
    where: {
      subSection: {
        courseSection: {
          courseId: courseId as string,
          slug: courseSectionSlug as string,
        },
      },
    },
    select: {
      id: true,
      fields: true,
      tags: true,
      type: true,
    },
    orderBy: [
      { subSection: { index: "asc" } },
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
      courseId,
      title: `${courseSection.title}, ${courseSection.course.title}`,
      flashcardsHasPart,
      flashcards,
      courseSectionSlug,
      editAccess,
    } as FlashcardsPageProps,
  };
};
