import type { GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

const getAuthServerSession = async (
  context: GetServerSidePropsContext
): Promise<
  { session: Session; props: undefined } | { props: Record<string, never> }
> => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) return { props: {} };

  return { session, props: undefined };
};

export default getAuthServerSession;
