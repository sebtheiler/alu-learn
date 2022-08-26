import ExploreDecksPage from "@/pages/ExploreDecksPage";
import type { NextPage } from "next";

export { getServerSideProps } from "lib/getSessionSSR";

const CommunityDecksHome: NextPage = () => <ExploreDecksPage />;

export default CommunityDecksHome;
