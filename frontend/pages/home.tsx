import { NextPage } from "../lib/types";
import HomePage from "pages/HomePage";

export { getServerSideProps } from "../lib/getSessionSSR";

const Home: NextPage = () => <HomePage />;
Home.authRequired = true;

export default Home;
