import ProUpgradePage from "@/pages/ProUpgradePage";
import type { ProUpgradePageProps } from "@/pages/ProUpgradePage";
import { getSessionAndStreak } from "helpers/getSessionSSR";
import type { GetServerSideProps, NextPage } from "next";

const ProUpgrade: NextPage<ProUpgradePageProps> = (
  props: ProUpgradePageProps
) => <ProUpgradePage {...props} />;

export default ProUpgrade;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const proTrialExpires = "2023-01-01";
  const isPro = false;
  const isProFromOrg = false;
  const isSignedIn = true;
  const { session, streak } = await getSessionAndStreak(context);

  return {
    props: {
      proTrialExpires,
      isPro,
      isProFromOrg,
      isSignedIn,
      session,
      streak,
    } as ProUpgradePageProps,
  };
};
