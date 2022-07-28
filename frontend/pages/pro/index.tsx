import type { GetServerSideProps, NextPage } from "next";
import ProUpgradePage from "pages/ProUpgradePage";
import type { ProUpgradePageProps } from "pages/ProUpgradePage";

const ProUpgrade: NextPage<ProUpgradePageProps> = (
  props: ProUpgradePageProps
) => <ProUpgradePage {...props} />;

export default ProUpgrade;

export const getServerSideProps: GetServerSideProps = async () => {
  const proTrialExpires = "2023-01-01";
  const isPro = false;
  const isProFromOrg = false;
  const isSignedIn = true;

  return {
    props: {
      proTrialExpires,
      isPro,
      isProFromOrg,
      isSignedIn,
    } as ProUpgradePageProps,
  };
};
