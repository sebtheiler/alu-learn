import type { GetStaticProps, NextPage } from "next";
import NotFoundPage from "pages/NotFoundPage";

const NotFound: NextPage = () => <NotFoundPage />;

export default NotFound;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
