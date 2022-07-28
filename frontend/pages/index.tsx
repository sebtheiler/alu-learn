import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import LandingPage from "pages/LandingPage";

const Index: NextPage = () => <LandingPage />;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
