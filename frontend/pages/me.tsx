import { authOptions } from "./api/auth/[...nextauth]";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";

const Index: NextPage = () => <div />;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const { username } = (await getUserSSR(session, { username: true })) ?? {};

  if (username) {
    return {
      redirect: {
        destination: `/user/${username}`,
        permanent: false,
      },
    };
  } else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
