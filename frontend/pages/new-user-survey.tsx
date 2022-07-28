import type { NextPage } from "../lib/types";
import NewUserSurveyPage from "pages/NewUserSurveyPage";

const NewUserSurvey: NextPage = () => <NewUserSurveyPage />;
NewUserSurvey.authRequired = true;

export default NewUserSurvey;
