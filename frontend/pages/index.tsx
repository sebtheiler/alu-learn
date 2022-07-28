import type { GetStaticProps, NextPage } from "next";
import LandingPage from "pages/LandingPage";

const Index: NextPage = () => <LandingPage />;

export default Index;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
