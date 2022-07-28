import type { GetStaticProps, NextPage } from "next";
import AboutPage from "pages/AboutPage";

const About: NextPage = () => <AboutPage />;

export default About;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
