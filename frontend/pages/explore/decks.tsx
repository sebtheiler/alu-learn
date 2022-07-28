import type { GetStaticProps, NextPage } from "next";
import ExploreDecksPage from "pages/ExploreDecksPage";

const CommunityDecksHome: NextPage = () => <ExploreDecksPage />;

export default CommunityDecksHome;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
