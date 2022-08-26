import CreateFlashcardsPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "pages/CreateFlashcardsPage",
  component: CreateFlashcardsPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof CreateFlashcardsPage> = (args) => (
  <CreateFlashcardsPage {...args} />
);

export const CreateFlashcardsPageExample = Template.bind({});
CreateFlashcardsPageExample.parameters = {
  layout: "fullscreen",
};
