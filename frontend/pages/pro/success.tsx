import type { NextPage } from "next";
import ProUpgradeSuccessPage from "pages/ProUpgradeSuccessPage";

export { getServerSideProps } from "../../lib/getSessionSSR";

const ProPurchaseSuccess: NextPage = () => <ProUpgradeSuccessPage />;

export default ProPurchaseSuccess;
