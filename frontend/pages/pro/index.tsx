import ProUpgradePage from "@/pages/ProUpgradePage";
import type { ProUpgradePageProps } from "@/pages/ProUpgradePage";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

const ProUpgrade: NextPage<ProUpgradePageProps> = (
  props: ProUpgradePageProps
) => <ProUpgradePage {...props} />;

export default ProUpgrade;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, { isPro: true, isProFromOrg: true });
  const { isPro, isProFromOrg } = user ?? {};

  const proTrialExpires = "2023-01-01";

  return {
    props: {
      proTrialExpires,
      isPro: isPro ?? null,
      isProFromOrg: isProFromOrg ?? null,
      isSignedIn: !!session,
    } as ProUpgradePageProps,
  };
};
