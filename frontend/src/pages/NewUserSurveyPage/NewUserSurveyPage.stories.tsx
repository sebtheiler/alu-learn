import NewUserSurveyPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

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
