import FlashcardsPage from "@/pages/FlashcardsPage";
import type { FlashcardsPageProps } from "@/pages/FlashcardsPage";
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
  const { courseId, page } = context.query;
  const session = await getServerSession(context);

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

  const flashcards = await getFlashcards({
    courseId: courseId as string,
    pageNum: parseInt((page as string | undefined) ?? "0"),
    otherCriteria: {
      reviewInstances: {
        some: {
          isStarred: true,
        }
      }
    }
  });

  const editAccess = await canEditCourse(
    courseId as string,
    session?.user?.email
  );

  return {
    props: {
      course,
      title: 'Starred',
      flashcards,
      editAccess,
      isStarred: true,
    } as FlashcardsPageProps,
  };
};

