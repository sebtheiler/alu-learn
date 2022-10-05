import SignInPage from "@/pages/SignInPage";
import { GetStaticProps } from "next";
import type { NextPage } from "types";

const SignIn: NextPage = () => <SignInPage />;

export default SignIn;

export const getStaticProps: GetStaticProps = async () => {
  {
    return {
      props: {},
    };
  }
};
