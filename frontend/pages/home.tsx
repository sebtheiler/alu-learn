import { NextPage } from "../lib/types";
import type { GetServerSideProps } from "next";
import HomePage from "pages/HomePage";

const Home: NextPage = () => <HomePage />;
Home.authRequired = true;

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
