import prisma from "../lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]";
import HomePage from "@/pages/HomePage";
import type { HomePageProps } from "@/pages/HomePage";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";

const Home: NextPage<HomePageProps> & { authRequired: boolean } = (
  props: HomePageProps
) => <HomePage {...props} />;
Home.authRequired = true;

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, {
    numReviewsDoneToday: true,
    targetNumReviews: true,
  });

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
      courses,
      reviewsDone: user?.numReviewsDoneToday,
      targetReviewsDone: user?.targetNumReviews,
    } as HomePageProps,
  };
};
