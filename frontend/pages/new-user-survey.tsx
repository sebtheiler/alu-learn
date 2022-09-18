import NewUserSurveyPage from "@/pages/NewUserSurveyPage";
import { GetServerSideProps } from "next";
import type { NextPage } from "types";

const NewUserSurvey: NextPage = () => <NewUserSurveyPage />;
NewUserSurvey.authRequired = true;

export default NewUserSurvey;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
