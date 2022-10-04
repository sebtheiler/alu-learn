import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import type { Flashcard } from "@/types";
import flashcardsSEO from "course/flashcardsSEO";
import getFlashcards from "course/getFlashcards";
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
  const { courseId, courseSectionSlug, page } = context.query;
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
          seoDescription: true,
          seoSubject: true,
          id: true,
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

  const flashcards = await getFlashcards({
    courseId: courseId as string,
    courseSectionSlug: courseSectionSlug as string,
    pageNum: parseInt((page as string | undefined) ?? "0"),
  });

  const editAccess = await canEditCourse(
    courseId as string,
    session?.user?.email
  );

  const flashcardsHasPart = await flashcardsSEO(flashcards as Flashcard[]);

  return {
    props: {
      course: courseSection.course,
      title: `${courseSection.title}, ${courseSection.course.title}`,
      flashcardsHasPart,
      flashcards,
      courseSectionSlug,
      editAccess,
    } as FlashcardsPageProps,
  };
};
