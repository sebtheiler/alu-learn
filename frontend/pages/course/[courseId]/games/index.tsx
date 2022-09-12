import GamesPage from "@/pages/GamesPage";
import type { GetServerSideProps, NextPage } from "next";

const Games: NextPage = () => <GamesPage />;

export default Games;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
