import { getSessionAndStreak } from "../lib/getSessionSSR";
import prisma from "../lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import HomePage from "pages/HomePage";
import type { HomePageProps } from "pages/HomePage";

const Home: NextPage<HomePageProps> & { authRequired: boolean } = (
  props: HomePageProps
) => <HomePage {...props} />;
Home.authRequired = true;

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, streak } = await getSessionAndStreak(context);

  const courses = await prisma.course.findMany({
    where: {
      users: {
        some: {
          email: session?.user?.email,
        },
      },
    },
  });

  return {
    props: {
      session,
      streak,
      courses,
    } as HomePageProps,
  };
};
