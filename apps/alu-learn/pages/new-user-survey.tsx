import NewUserSurveyPage from "@/pages/NewUserSurveyPage";
import { NewUserSurveyPageProps } from "@/pages/NewUserSurveyPage/NewUserSurveyPage";
import getAuthServerSession from "helpers/getAuthServerSession";
import getUserSSR from "helpers/getUserSSR";
import { GetServerSideProps } from "next";
import type { NextPage } from "types";

const NewUserSurvey: NextPage<NewUserSurveyPageProps> = (props) => (
  <NewUserSurveyPage {...props} />
);
NewUserSurvey.authRequired = true;

export default NewUserSurvey;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;
  const user = await getUserSSR(session, { id: true, name: true });

  return {
    props: {
      user,
    } as NewUserSurveyPageProps,
  };
};
