import getAuthServerSession from "helpers/getAuthServerSession";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps, NextPage } from "next";

const Index: NextPage = () => <div />;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

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
