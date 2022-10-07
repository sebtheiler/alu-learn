import SearchFlashcardsPage from "@/pages/SearchFlashcardsPage";
import type { SearchFlashcardsPageProps } from "@/pages/SearchFlashcardsPage";
import canEditCourse from "helpers/canEditCourse";
import canViewCourse from "helpers/canViewCourse";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
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
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

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
