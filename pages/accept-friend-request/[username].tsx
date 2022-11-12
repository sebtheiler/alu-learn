import friendUsers from "helpers/friendUsers";
import getAuthServerSession from "helpers/getAuthServerSession";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import { signIn } from "next-auth/react";

const Index: NextPage = () => <div />;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username: otherUsername } = context.query;

  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const { username: meUsername } =
    (await getUserSSR(session, { username: true })) ?? {};
  if (!meUsername) {
    signIn();
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // Check if the user by the given username has requested the current user
  const hasRequestedMe =
    (await prisma.user.count({
      where: {
        username: otherUsername as string,
        friendsRequested: {
          some: {
            username: meUsername,
          },
        },
      },
    })) > 0;

  if (hasRequestedMe) {
    const { id: meId } = await prisma.user.findUniqueOrThrow({
      where: { username: meUsername },
    });
    const { id: otherId } = await prisma.user.findUniqueOrThrow({
      where: { username: otherUsername as string },
    });
    await friendUsers(meId, otherId, prisma);
  }

  return {
    redirect: {
      destination: "/home",
      permanent: false,
    },
  };
};
