import SignUpSurveyPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/SignUpSurveyPage",
  component: SignUpSurveyPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof SignUpSurveyPage> = () => (
  <SignUpSurveyPage />
);

export const SignUpSurveyPageExample = Template.bind({});
SignUpSurveyPageExample.parameters = {
  layout: "fullscreen",
};
