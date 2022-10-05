import GamesPage from "@/pages/GamesPage";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Games: NextPage = () => <GamesPage />;
Games.authRequired = true;
Games.proRequired = true;

export default Games;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
