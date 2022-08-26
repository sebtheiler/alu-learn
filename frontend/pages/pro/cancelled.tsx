import ProUpgradeCancelledPage from "@/pages/ProUpgradeCancelledPage";
import type { NextPage } from "next";

export { getServerSideProps } from "lib/getSessionSSR";

const ProUpgradeCancelled: NextPage = () => <ProUpgradeCancelledPage />;

export default ProUpgradeCancelled;
