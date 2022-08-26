import CreateFlashcardsPage from "@/pages/CreateFlashcardsPage";
import type { CreateFlashcardsPageProps } from "@/pages/CreateFlashcardsPage";
import { getSessionAndStreak } from "helpers/getSessionSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { NextPage } from "types";

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
          slug: true,
          subSections: {
            select: {
              id: true,
              title: true,
              slug: true,
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
