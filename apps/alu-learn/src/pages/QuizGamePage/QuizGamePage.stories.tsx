import QuizGamePage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/QuizGamePage",
  component: QuizGamePage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof QuizGamePage> = (args) => (
  <QuizGamePage {...args} />
);

export const QuizGamePageExample = Template.bind({});
QuizGamePageExample.parameters = {
  layout: "fullscreen",
};
