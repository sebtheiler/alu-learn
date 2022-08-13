import type { NextPage } from "next";
import ExploreDecksPage from "pages/ExploreDecksPage";

export { getServerSideProps } from "../../lib/getSessionSSR";

const CommunityDecksHome: NextPage = () => <ExploreDecksPage />;

export default CommunityDecksHome;
