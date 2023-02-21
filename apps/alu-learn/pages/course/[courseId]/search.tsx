import SearchFlashcardsPage from "@/pages/SearchFlashcardsPage";
import type { SearchFlashcardsPageProps } from "@/pages/SearchFlashcardsPage";
import canEditCourse from "helpers/canEditCourse";
import canViewCourse from "helpers/canViewCourse";
import getServerSession from "helpers/getServerSession";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const SearchFlashcards: NextPage<SearchFlashcardsPageProps> = (
  props: SearchFlashcardsPageProps
) => <SearchFlashcardsPage {...props} />;

export default SearchFlashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.query;
  const course = await prisma.course.findUnique({
    where: { id: courseId as string },
    select: {
      id: true,
      title: true,
    },
  });
  const session = await getServerSession(context);

  if (!course || !canViewCourse(courseId as string, session?.user?.email)) {
    return {
      notFound: true,
    };
  }

  const canEdit =
    session?.user &&
    (await canEditCourse(courseId as string, session.user.email));

  return {
    props: {
      course,
      canEditCourse: canEdit,
    } as SearchFlashcardsPageProps,
  };
};
