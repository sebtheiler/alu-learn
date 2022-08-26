import type { NextPage } from "../types";
import NewUserSurveyPage from "@/pages/NewUserSurveyPage";

export { getServerSideProps } from "helpers/getSessionSSR";

const NewUserSurvey: NextPage = () => <NewUserSurveyPage />;
NewUserSurvey.authRequired = true;

export default NewUserSurvey;
