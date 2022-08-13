import { authOptions } from "../api/auth/[...nextauth]";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import ProUpgradePage from "pages/ProUpgradePage";
import type { ProUpgradePageProps } from "pages/ProUpgradePage";

const ProUpgrade: NextPage<ProUpgradePageProps> = (
  props: ProUpgradePageProps
) => <ProUpgradePage {...props} />;

export default ProUpgrade;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const proTrialExpires = "2023-01-01";
  const isPro = false;
  const isProFromOrg = false;
  const isSignedIn = true;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  return {
    props: {
      proTrialExpires,
      isPro,
      isProFromOrg,
      isSignedIn,
      session,
    } as ProUpgradePageProps,
  };
};
