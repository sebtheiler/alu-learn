import ProUpgradeSuccessPage from "@/pages/ProUpgradeSuccessPage";
import type { NextPage } from "next";

export { getServerSideProps } from "helpers/getSessionSSR";

const ProPurchaseSuccess: NextPage = () => <ProUpgradeSuccessPage />;

export default ProPurchaseSuccess;
