import type { NextPage } from "../types";
import NewUserSurveyPage from "@/pages/NewUserSurveyPage";
import { GetServerSideProps } from "next";

const NewUserSurvey: NextPage = () => <NewUserSurveyPage />;
NewUserSurvey.authRequired = true;

export default NewUserSurvey;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
