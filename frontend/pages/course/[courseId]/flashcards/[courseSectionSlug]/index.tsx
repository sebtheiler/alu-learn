import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
import canEditCourse from "helpers/canEditCourse";
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

  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const editAccess = await canEditCourse(
    courseId as string,
    session?.user?.email
  );

  return {
    props: {
      courseId,
      flashcards,
      courseSectionSlug,
      editAccess,
    } as FlashcardsPageProps,
  };
};
