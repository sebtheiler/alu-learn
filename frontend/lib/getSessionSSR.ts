import { authOptions } from "../pages/api/auth/[...nextauth]";
import getUserSSR from "./getUserSSR";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  PreviewData,
} from "next";
import { unstable_getServerSession } from "next-auth";
import type { ParsedUrlQuery } from "querystring";

/**
 * Helper function to automatically inject a NextAuth `session` and `streak` data
 * into `_app.tsx`. Each page that is accessible when the user is signed-in must
 * either use `export { getServerSideProps } from "../lib/getSessonSSR"` or return
 * props with the `settings` object in their own `getSeverSideProps`.
 * The `session` object is required for the Navbar to display the proper
 * @returns Props for the given page that includes the NextAuth `session`
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, streak } = await getSessionAndStreak(context);

  return {
    props: {
      session,
      streak,
    },
  };
};

/**
 * Helper function to the current user's session and streak.
 * @returns The current user's session and streak
 */
export const getSessionAndStreak = async (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = session
    ? await getUserSSR(session, {
        currentStreak: true,
        doneReviewsToday: true,
      })
    : null;

  return {
    session,
    streak: {
      currentStreak: user?.currentStreak ?? null,
      doneReviewsToday: user?.doneReviewsToday ?? null,
    },
  };
};
