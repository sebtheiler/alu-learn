import AutoFlashcardsPage from "@/pages/AutoFlashcardsPage";
import type { AutoFlashcardsPageProps } from "@/pages/AutoFlashcardsPage";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const AutoFlashcards: NextPage<AutoFlashcardsPageProps> = (props) => (
  <AutoFlashcardsPage {...props} />
);

export default AutoFlashcards;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);
  const user = session
    ? await getUserSSR(session, {
        numAutoFlashcardsGenerated: true,
        isPro: true,
      })
    : null;

  return {
    props: {
      signedIn: !!session,
      numAutoFlashcardsGenerated: user?.numAutoFlashcardsGenerated ?? null,
      isPro: user?.isPro ?? null,
    } as AutoFlashcardsPageProps,
  };
};
