import getServerSession from "./getServerSession";
import type { GetServerSidePropsContext } from "next";
import type { Session } from "next-auth";

const getAuthServerSession = async (
  context: GetServerSidePropsContext
): Promise<
  { session: Session; props: undefined } | { props: Record<string, never> }
> => {
  const session = await getServerSession(context);
  if (!session) return { props: {} };

  return { session, props: undefined };
};

export default getAuthServerSession;
