import ProUpgradeCancelledPage from "@/pages/ProUpgradeCancelledPage";
import type { GetStaticProps, NextPage } from "next";

const ProUpgradeCancelled: NextPage = () => <ProUpgradeCancelledPage />;

export default ProUpgradeCancelled;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
