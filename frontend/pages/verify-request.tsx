import VerifyRequestPage from "@/pages/VerifyRequestPage";
import type { GetStaticProps } from "next";
import type { NextPage } from "types";

const VerifyRequest: NextPage = () => <VerifyRequestPage />;

export default VerifyRequest;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
