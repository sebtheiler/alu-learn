import ExploreDecksPage from "@/pages/ExploreDecksPage";
import type { GetServerSideProps, NextPage } from "next";

const CommunityDecksHome: NextPage = () => <ExploreDecksPage />;

export default CommunityDecksHome;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
