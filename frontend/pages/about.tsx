import AboutPage from "@/pages/AboutPage";
import type { NextPage } from "next";

export { getServerSideProps } from "../lib/getSessionSSR";

const About: NextPage = () => <AboutPage />;

export default About;
