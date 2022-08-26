import prisma from "../lib/prisma";
import HomePage from "@/pages/HomePage";
import type { HomePageProps } from "@/pages/HomePage";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import { getSessionAndStreak } from "helpers/getSessionSSR";
import type { GetServerSideProps, NextPage } from "next";

const Home: NextPage<HomePageProps> & { authRequired: boolean } = (
  props: HomePageProps
) => <HomePage {...props} />;
Home.authRequired = true;

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, streak } = await getSessionAndStreak(context);

  let courses = await prisma.course.findMany({
    where: {
      users: {
        some: {
          email: session?.user?.email,
        },
      },
    },
    select: {
      id: true,
      title: true,
      bannerImage: true,
    },
  });

  courses = courses.map((course) => ({
    ...course,
    bannerImage: course.bannerImage
      ? generateSignedS3URL(course.bannerImage)
      : null,
  }));

  return {
    props: {
      session,
      streak,
      courses,
    } as HomePageProps,
  };
};
