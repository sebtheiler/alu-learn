import NewUserSurveyPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/NewUserSurveyPage",
  component: NewUserSurveyPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof NewUserSurveyPage> = (props) => (
  <NewUserSurveyPage {...props} />
);

export const NewUserSurveyPageExample = Template.bind({});
NewUserSurveyPageExample.parameters = {
  layout: "fullscreen",
};
