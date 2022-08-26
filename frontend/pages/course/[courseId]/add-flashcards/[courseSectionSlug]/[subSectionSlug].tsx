import { getSessionAndStreak } from "../../../../../lib/getSessionSSR";
import prisma from "../../../../../lib/prisma";
import { NextPage } from "../../../../../lib/types";
import type { GetServerSideProps } from "next";
import CreateFlashcardsPage from "pages/CreateFlashcardsPage";
import type { CreateFlashcardsPageProps } from "pages/CreateFlashcardsPage";

const CreateFlashcards: NextPage = (props: CreateFlashcardsPageProps) => (
  <CreateFlashcardsPage {...props} />
);

export default CreateFlashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, streak } = await getSessionAndStreak(context);
  const { courseId, courseSectionSlug, subSectionSlug } = context.query;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId as string,
    },
    select: {
      id: true,
      title: true,
      courseSections: {
        select: {
          id: true,
          title: true,
          subSections: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return {
    props: {
      session,
      streak,
      course,
      courseSectionSlug,
      subSectionSlug,
    } as CreateFlashcardsPageProps,
  };
};
