import ProUpgradeSuccessPage from "@/pages/ProUpgradeSuccessPage";
import type { GetStaticProps, NextPage } from "next";

const ProPurchaseSuccess: NextPage = () => <ProUpgradeSuccessPage />;

export default ProPurchaseSuccess;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
