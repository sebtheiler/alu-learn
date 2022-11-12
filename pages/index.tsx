import daysBetween from "@/helpers/daysBetween";
import LandingPage from "@/pages/LandingPage";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import sendSlackMessage from "helpers/sendSlackMessage";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";

const Index: NextPage = () => <LandingPage />;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);

  if (session) {
    const { referredBy } = context.query;
    if (referredBy) {
      const me = await getUserSSR(session, {
        id: true,
        createdAt: true,
        referredById: true,
        proTrialExpires: true,
        name: true,
      });

      // Only trigger if the user was not reffered by anyone else already
      // and their account was created within the past day
      if (
        me &&
        !me.referredById &&
        daysBetween(me?.createdAt as Date, new Date()) < 1
      ) {
        const referringUser = await prisma.user.findUnique({
          where: {
            username: referredBy as string,
          },
          select: {
            id: true,
            proTrialExpires: true,
            name: true,
          },
        });

        if (referringUser) {
          // Give both users a free week of Alu pro
          const expireDateMe = me.proTrialExpires ?? new Date();
          const expireDateReferrer =
            referringUser.proTrialExpires ?? new Date();
          expireDateMe.setDate(expireDateMe.getDate() + 7);
          expireDateReferrer.setDate(expireDateReferrer.getDate() + 7);

          await prisma.user.update({
            where: {
              id: me?.id,
            },
            data: {
              referredById: referringUser.id,
              proTrialExpires: expireDateMe,
              isPro: true,
            },
          });

          await prisma.user.update({
            where: {
              id: referringUser.id,
            },
            data: {
              proTrialExpires: expireDateReferrer,
              isPro: true,
            },
          });

          sendSlackMessage(`${referringUser.name} has referred ${me.name}`);
        }
      }
    }

    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
