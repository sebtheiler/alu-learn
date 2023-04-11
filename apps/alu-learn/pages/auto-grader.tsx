import AutoGraderPage from "@/pages/AutoGraderPage";
import type { AutoGraderPageProps } from "@/pages/AutoGraderPage";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const AutoGrader: NextPage<AutoGraderPageProps> = (props) => (
  <AutoGraderPage {...props} />
);

export default AutoGrader;

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
    } as AutoGraderPageProps,
  };
};
