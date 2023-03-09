import NewUserSurveyPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/NewUserSurveyPage",
  component: NewUserSurveyPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof NewUserSurveyPage> = (props) => (
  <NewUserSurveyPage {...props} />
);

export const NewUserSurveyPageExample = Template.bind({});
NewUserSurveyPageExample.parameters = {
  layout: "fullscreen",
};
