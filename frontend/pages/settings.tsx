import SettingsPage, { SettingsPageProps } from "@/pages/SettingsPage";
import getAuthServerSession from "helpers/getAuthServerSession";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps } from "next";
import { signIn } from "next-auth/react";
import type { NextPage } from "types";

const Settings: NextPage = (props: SettingsPageProps) => (
  <SettingsPage {...props} />
);
Settings.authRequired = true;

export default Settings;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

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
      targetNumReviews: user?.targetNumReviews,
      sendMarketingResearch: user?.sendMarketingResearch,
    } as SettingsPageProps,
  };
};
