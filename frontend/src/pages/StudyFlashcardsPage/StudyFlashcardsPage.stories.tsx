import StudyFlashcardsPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "pages/StudyFlashcardsPage",
  component: StudyFlashcardsPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof StudyFlashcardsPage> = (args) => (
  <StudyFlashcardsPage {...args} />
);

export const StudyFlashcardsPageExample = Template.bind({});
StudyFlashcardsPageExample.parameters = {
  layout: "fullscreen",
};
