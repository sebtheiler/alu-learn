import type { NextPage } from "../../lib/types";
import type { GetServerSideProps } from "next";
import SignInPage from "pages/SignInPage";

const SignIn: NextPage = () => <SignInPage />;

export default SignIn;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
