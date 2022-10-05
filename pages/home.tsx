import prisma from "../lib/prisma";
import HomePage from "@/pages/HomePage";
import type { HomePageProps } from "@/pages/HomePage";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import getAuthServerSession from "helpers/getAuthServerSession";
import getRequestMetadata from "helpers/getRequestMetadata";
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

  // Log the user visit
  // (ideally this would be done w/ middleware, but I can't get that working)
  const morning = new Date();
  morning.setHours(0, 0, 0, 0);
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);

  if (
    (await prisma.userVisit.count({
      where: {
        userId: user?.id,
        timestamp: {
          gte: morning,
          lte: midnight,
        },
      },
    })) === 0
  ) {
    const { remoteAddr, userAgent } = getRequestMetadata(context.req);

    await prisma.userVisit.create({
      data: {
        remoteAddr,
        userAgent,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
  }

  // Fetch the user's courses and classes
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

  // Fetch the user's history
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
