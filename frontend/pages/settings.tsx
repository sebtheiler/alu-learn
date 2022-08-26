import getUserSSR from "../lib/getUserSSR";
import type { NextPage } from "../lib/types";
import { authOptions } from "./api/auth/[...nextauth]";
import SettingsPage, { SettingsPageProps } from "@/pages/SettingsPage";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

const Settings: NextPage = (props: SettingsPageProps) => (
  <SettingsPage {...props} />
);
Settings.authRequired = true;

export default Settings;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    signIn();
  }

  const user = await getUserSSR(session);

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
