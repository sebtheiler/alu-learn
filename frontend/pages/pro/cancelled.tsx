import type { NextPage } from "next";
import ProUpgradeCancelledPage from "pages/ProUpgradeCancelledPage";

export { getServerSideProps } from "../../lib/getSessionSSR";

const ProUpgradeCancelled: NextPage = () => <ProUpgradeCancelledPage />;

export default ProUpgradeCancelled;
