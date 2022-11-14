import ProUpgradePage from "@/pages/ProUpgradePage";
import type { ProUpgradePageProps } from "@/pages/ProUpgradePage";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps, NextPage } from "next";

const ProUpgrade: NextPage<ProUpgradePageProps> = (
  props: ProUpgradePageProps
) => <ProUpgradePage {...props} />;

export default ProUpgrade;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);
  const user = await getUserSSR(session, {
    isPro: true,
    isProFromOrg: true,
    proTrialExpires: true,
  });
  const { isPro, isProFromOrg, proTrialExpires } = user ?? {};

  return {
    props: {
      isPro: isPro ?? null,
      isProFromOrg: isProFromOrg ?? null,
      proTrialExpires: proTrialExpires?.toString() ?? null,
      isSignedIn: !!session,
    } as ProUpgradePageProps,
  };
};
