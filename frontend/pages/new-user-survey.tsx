import type { NextPage } from "../lib/types";
import NewUserSurveyPage from "@/pages/NewUserSurveyPage";

export { getServerSideProps } from "../lib/getSessionSSR";

const NewUserSurvey: NextPage = () => <NewUserSurveyPage />;
NewUserSurvey.authRequired = true;

export default NewUserSurvey;
