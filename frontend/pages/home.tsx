import prisma from "../lib/prisma";
import HomePage from "@/pages/HomePage";
import type { HomePageProps } from "@/pages/HomePage";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import getAuthServerSession from "helpers/getAuthServerSession";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Home: NextPage<HomePageProps> = (props: HomePageProps) => (
  <HomePage {...props} />
);
Home.authRequired = true;

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const user = await getUserSSR(session, {
    numReviewsDoneToday: true,
    targetNumReviews: true,
    id: true,
    userType: true,
  });

  let courses = await prisma.course.findMany({
    where: {
      users: {
        some: {
          email: session?.user?.email ?? null,
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

  const classes = await prisma.classroom.findMany({
    where: {
      students: {
        some: {
          email: session?.user?.email ?? null,
        },
      },
    },
    select: {
      id: true,
      title: true,
      teachers: {
        select: {
          name: true,
        },
      },
    },
  });

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const history = await prisma.historySegment.findMany({
    where: {
      userId: user?.id,
      date: {
        gte: startDate,
      },
    },
    select: {
      date: true,
      reviewsStudied: true,
      timeTaken: true,
    },
  });

  return {
    props: {
      courses,
      classes,
      reviewsDone: user?.numReviewsDoneToday ?? null,
      targetReviewsDone: user?.targetNumReviews ?? null,
      history: JSON.parse(JSON.stringify(history)),
      userType: user?.userType,
    } as HomePageProps,
  };
};
