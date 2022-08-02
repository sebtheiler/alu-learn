import prisma from "../lib/prisma";
import type { NextPage } from "../lib/types";
import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import SettingsPage, { SettingsPageProps } from "pages/SettingsPage";

const Settings: NextPage = (props: SettingsPageProps) => (
  <SettingsPage {...props} />
);
Settings.authRequired = true;

export default Settings;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
  });

  return {
    props: {
      name: user?.name,
      timezoneOffset: user?.timezoneOffset,
      userType: user?.userType,
      sendReminders: user?.sendReminders,
      targetNumCards: user?.targetNumCards,
      sendMarketingResearch: user?.sendMarketingResearch,
    } as SettingsPageProps,
  };
};
