import AboutPage from "@/pages/AboutPage";
import type { GetStaticProps, NextPage } from "next";

const About: NextPage = () => <AboutPage />;

export default About;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
