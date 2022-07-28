import NewUserSurveyPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/NewUserSurveyPage",
  component: NewUserSurveyPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof NewUserSurveyPage> = () => (
  <NewUserSurveyPage />
);

export const NewUserSurveyPageExample = Template.bind({});
NewUserSurveyPageExample.parameters = {
  layout: "fullscreen",
};
