import type { NextPage } from "next";
import AboutPage from "pages/AboutPage";

export { getServerSideProps } from "../lib/getSessionSSR";

const About: NextPage = () => <AboutPage />;

export default About;
