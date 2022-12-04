import AutoFlashcardsPage from "@/pages/AutoFlashcardsPage";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const AutoFlashcards: NextPage = () => <AutoFlashcardsPage />;

export default AutoFlashcards;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
