import daysBetween from "@/helpers/daysBetween";
import AdminPage from "@/pages/AdminPage";
import type { AdminPageProps } from "@/pages/AdminPage";
import type { DateData } from "@/pages/AdminPage/AdminPage";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Admin: NextPage<AdminPageProps> = (props: AdminPageProps) => (
  <AdminPage {...props} />
);

export default Admin;

/**
 * Generate a list of `DateData` objects that start at some date and continue until present
 * The `DateData` objects' `num` attribute is initialized to 0
 * @param startDate Date to start data from
 * @returns
 */
const generateDateData = (startDate: Date) => {
  const dateData: DateData[] = [];
  for (let i = Math.abs(daysBetween(startDate, new Date())); i >= -1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateData.push({
      date: date.toISOString().slice(0, 10),
      num: 0,
    });
  }

  return dateData;
};

// Helpers to make sorting by non-WESS users easier
type QueryMode = "insensitive";

export const notWESS = {
  NOT: [
    {
      email: {
        contains: "westendsecondary",
        mode: "insensitive" as QueryMode,
      },
    },
  ],
};
export const notWESSUser = {
  NOT: [
    {
      user: {
        email: {
          contains: "westendsecondary",
          mode: "insensitive" as QueryMode,
        },
      },
    },
  ],
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);
  const user = await getUserSSR(session, { id: true, isStaff: true });

  if (!user?.isStaff)
    return {
      redirect: {
        destination: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        permanent: false,
      },
    };

  const nonWESSOnly = context.query.nonWESSOnly === "true";

  const thisMorning = new Date();
  thisMorning.setUTCHours(0, 0, 0, 0);

  const dayAgo = new Date();
  dayAgo.setDate(dayAgo.getDate() - 1);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // # Sign-ups
  const totalNumberOfUsers = await prisma.user.count({
    where: nonWESSOnly ? notWESS : undefined,
  });
  const numSignUpsInPastWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: weekAgo,
      },
      ...(nonWESSOnly ? notWESS : {}),
    },
  });

  // ## Timeline of sign ups
  const createdAtData = (
    await prisma.user.findMany({
      where: {
        createdAt: {
          gte: monthAgo,
        },
        ...(nonWESSOnly ? notWESS : {}),
      },
      select: {
        createdAt: true,
      },
    })
  ).map((user) => user.createdAt);
  const signUpData: DateData[] = generateDateData(monthAgo);
  for (const createdAt of createdAtData) {
    const date = createdAt.toISOString().slice(0, 10);
    const index = signUpData.findIndex((signUp) => signUp.date === date);
    signUpData[index].num++;
  }

  // # User Activity
  const numVisitsToday = await prisma.userVisit.count({
    where: {
      timestamp: {
        gte: thisMorning,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
  });
  const numVisitsInTheWeek = await prisma.userVisit.count({
    where: {
      timestamp: {
        gte: weekAgo,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
  });
  const weeklyActiveUserData = await prisma.userVisit.findMany({
    where: {
      timestamp: {
        gte: weekAgo,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
    select: {
      userId: true,
    },
  });
  const weeklyActiveUsers: string[] = [];
  for (const weeklyActiveUser of weeklyActiveUserData) {
    if (!weeklyActiveUsers.includes(weeklyActiveUser.userId))
      weeklyActiveUsers.push(weeklyActiveUser.userId);
  }
  const numWeeklyActiveUsers = weeklyActiveUsers.length;
  const avgDailyActiveUsers = numWeeklyActiveUsers / 7;

  // ## Timeline of visits
  const visitsTimestampData = (
    await prisma.userVisit.findMany({
      where: {
        timestamp: {
          gte: monthAgo,
        },
        ...(nonWESSOnly ? notWESSUser : {}),
      },
      select: {
        timestamp: true,
      },
    })
  ).map((visit) => visit.timestamp);
  const visitsData: DateData[] = generateDateData(monthAgo);
  for (const visitTimestamp of visitsTimestampData) {
    const date = visitTimestamp.toISOString().slice(0, 10);
    const index = visitsData.findIndex((visit) => visit.date === date);
    visitsData[index].num++;
  }

  // # Flashcard Activity
  const numUsersStudiedFlashcardsToday = await prisma.historySegment.count({
    where: {
      date: {
        gte: thisMorning,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
  });
  const numUsersStudiedFlashcardsThisWeek = await prisma.historySegment.count({
    where: {
      date: {
        gte: weekAgo,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
  });
  const amountStudiedToday = await prisma.historySegment.aggregate({
    where: {
      date: {
        gte: thisMorning,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
    _sum: {
      reviewsStudied: true,
      timeTaken: true,
    },
  });
  const numFlashcardsStudiedToday = amountStudiedToday._sum.reviewsStudied;
  const timeStudiedToday = amountStudiedToday._sum.timeTaken;

  const amountStudiedThisWeek = await prisma.historySegment.aggregate({
    where: {
      date: {
        gte: thisMorning,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
    _sum: {
      reviewsStudied: true,
      timeTaken: true,
    },
  });
  const numFlashcardsStudiedThisWeek =
    amountStudiedThisWeek._sum.reviewsStudied;
  const timeStudiedThisWeek = amountStudiedThisWeek._sum.timeTaken;

  // ## Timeline of studying
  const historySegmentsData = await prisma.historySegment.findMany({
    where: {
      date: {
        gte: monthAgo,
      },
      ...(nonWESSOnly ? notWESSUser : {}),
    },
    select: {
      reviewsStudied: true,
      date: true,
    },
  });
  const flashcardsStudiedData: DateData[] = generateDateData(monthAgo);
  for (const historySegment of historySegmentsData) {
    const date = historySegment.date.toISOString().slice(0, 10);
    const index = flashcardsStudiedData.findIndex(
      (visit) => visit.date === date
    );
    flashcardsStudiedData[index].num += historySegment.reviewsStudied;
  }

  // ## History segments from today
  const historySegmentsToday = JSON.parse(
    JSON.stringify(
      await prisma.historySegment.findMany({
        where: {
          date: {
            gte: dayAgo,
          },
          ...(nonWESSOnly ? notWESSUser : {}),
        },
        select: {
          reviewsStudied: true,
          timeTaken: true,
          id: true,
          userId: true,
          date: true,
          user: {
            select: {
              name: true,
              username: true,
              image: true,
              id: true,
            },
          },
        },
        distinct: ["userId"],
      })
    )
  );

  // # Auto Flashcards
  const autoFlashcardsGenerated = JSON.parse(
    JSON.stringify(
      await prisma.autoFlashcardsGeneration.findMany({
        where: nonWESSOnly ? notWESSUser : undefined,
        select: {
          id: true,
          timestamp: true,
          userId: true,
          inputText: true,
          generatedOutput: true,
          user: {
            select: {
              name: true,
              username: true,
              image: true,
              id: true,
            },
          },
        },
        orderBy: {
          timestamp: "desc",
        },
      })
    )
  );

  return {
    props: {
      totalNumberOfUsers,
      numSignUpsInPastWeek,
      signUpData,
      numVisitsToday,
      numVisitsInTheWeek,
      numWeeklyActiveUsers,
      avgDailyActiveUsers,
      visitsData,
      numUsersStudiedFlashcardsToday,
      numUsersStudiedFlashcardsThisWeek,
      numFlashcardsStudiedToday,
      numFlashcardsStudiedThisWeek,
      timeStudiedToday,
      timeStudiedThisWeek,
      flashcardsStudiedData,
      historySegmentsToday,
      autoFlashcardsGenerated,
    } as AdminPageProps,
  };
};
