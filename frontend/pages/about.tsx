import AboutPage from "@/pages/AboutPage";
import type { NextPage } from "next";

export { getServerSideProps } from "helpers/getSessionSSR";

const About: NextPage = () => <AboutPage />;

export default About;
