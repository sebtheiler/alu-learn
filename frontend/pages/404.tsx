import type { NextPage } from "next";
import NotFoundPage from "pages/NotFoundPage";

export { getServerSideProps } from "../lib/getSessionSSR";

const NotFound: NextPage = () => <NotFoundPage />;

export default NotFound;
