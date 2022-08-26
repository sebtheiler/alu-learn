import ProUpgradeCancelledPage from "@/pages/ProUpgradeCancelledPage";
import type { NextPage } from "next";

export { getServerSideProps } from "helpers/getSessionSSR";

const ProUpgradeCancelled: NextPage = () => <ProUpgradeCancelledPage />;

export default ProUpgradeCancelled;
