import ImportPage from "@/pages/ImportPage";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Import: NextPage = () => <ImportPage />;
Import.authRequired = true;

export default Import;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};
