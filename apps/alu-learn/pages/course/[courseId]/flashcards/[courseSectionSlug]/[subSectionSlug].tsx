import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import type { Flashcard } from "@/types";
import flashcardsSEO from "course/flashcardsSEO";
import getFlashcards from "course/getFlashcards";
import canEditCourse from "helpers/canEditCourse";
import canViewCourse from "helpers/canViewCourse";
import getServerSession from "helpers/getServerSession";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";

const Flashcards: NextPage<FlashcardsPageProps> = (
  props: FlashcardsPageProps
) => <FlashcardsPage {...props} />;

export default Flashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId, courseSectionSlug, subSectionSlug, page } = context.query;
  const session = await getServerSession(context);

  const subSection = await prisma.subSection.findFirst({
    where: {
      slug: subSectionSlug as string,
      courseSection: {
        slug: courseSectionSlug as string,
        courseId: courseId as string,
      },
    },
    select: {
      id: true,
      title: true,
      courseSection: {
        select: {
          course: {
            select: {
              title: true,
              seoDescription: true,
              seoSubject: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!subSection || !canViewCourse(courseId as string, session?.user?.email))
    return {
      notFound: true,
    };

  const flashcards = await getFlashcards({
    courseId: courseId as string,
    courseSectionSlug: courseSectionSlug as string,
    subSectionSlug: subSectionSlug as string,
    pageNum: parseInt((page as string | undefined) ?? "0"),
  });

  const editAccess = await canEditCourse(
    courseId as string,
    session?.user?.email
  );

  const flashcardsHasPart = await flashcardsSEO(flashcards as Flashcard[]);

  return {
    props: {
      course: subSection.courseSection.course,
      title: `${subSection.title}, ${subSection.courseSection.course.title}`,
      flashcardsHasPart,
      flashcards,
      courseSectionSlug,
      subSectionSlug,
      editAccess,
    } as FlashcardsPageProps,
  };
};
