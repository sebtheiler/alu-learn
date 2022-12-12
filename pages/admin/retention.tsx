import AdminRetentionPage, {
  AdminRetentionPageProps,
  RetentionData,
} from "@/pages/AdminPage/AdminRetentionPage";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Admin: NextPage<AdminRetentionPageProps> = (
  props: AdminRetentionPageProps
) => <AdminRetentionPage {...props} />;

export default Admin;

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

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Retention
  const usersInLastSixMonths = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
  });
  const retentionData: RetentionData[] = [];
  for (let i = 0; i <= 30; i++) {
    retentionData.push({
      day: i,
      num: 0,
    });
  }
  for (const user of usersInLastSixMonths) {
    for (let i = 0; i <= 30; i++) {
      const start = new Date(user.createdAt.toISOString());
      start.setDate(start.getDate() - 1 + i);
      const end = new Date(user.createdAt.toISOString());
      end.setDate(end.getDate() + 1 + i);

      const usedAlu =
        (await prisma.userVisit.count({
          where: {
            userId: user.id,
            AND: [
              {
                timestamp: {
                  gte: start,
                },
              },
              {
                timestamp: {
                  lte: end,
                },
              },
            ],
          },
        })) > 0 ||
        (await prisma.historySegment.count({
          where: {
            userId: user.id,
            AND: [
              {
                date: {
                  gte: start,
                },
              },
              {
                date: {
                  lte: end,
                },
              },
            ],
          },
        })) > 0;

      if (usedAlu) retentionData[i].num++;
    }
  }
  for (let i = 0; i < retentionData.length; i++) {
    retentionData[i].num /= usersInLastSixMonths.length;
  }

  return {
    props: {
      retentionData,
    } as AdminRetentionPageProps,
  };
};
