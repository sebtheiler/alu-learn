import { authOptions } from "../pages/api/auth/[...nextauth]";
import getUserSSR from "./getUserSSR";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";

/**
 * Helper function to automatically inject a NextAuth `session` and `streak` data
 * into `_app.tsx`. Each page that is accessible when the user is signed-in must
 * either use `export { getServerSideProps } from "../lib/getSessonSSR"` or return
 * props with the `settings` object in their own `getSeverSideProps`.
 * The `session` object is required for the Navbar to display the proper
 * @returns Props for the given page that includes the NextAuth `session`
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
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
    props: {
      session,
      streak: {
        currentStreak: user?.currentStreak,
        doneReviewsToday: user?.doneReviewsToday,
      },
    },
  };
};
