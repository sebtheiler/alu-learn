import ExploreCoursesPage, {
  ExploreCoursesPageProps,
} from "@/pages/ExploreCoursesPage";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";

const ExploreCourses: NextPage<ExploreCoursesPageProps> = (props) => (
  <ExploreCoursesPage {...props} />
);

export default ExploreCourses;

export const getServerSideProps: GetServerSideProps = async () => {
  const courses = await prisma.course.findMany({
    where: {
      privacySetting: "ALL",
      isPublic: true,
    },
    orderBy: {
      users: {
        _count: "desc",
      },
    },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      owners: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return {
    props: {
      courses,
    },
  };
};
