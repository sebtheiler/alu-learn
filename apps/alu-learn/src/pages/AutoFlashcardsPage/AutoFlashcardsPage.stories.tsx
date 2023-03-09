import AutoFlashcardsPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/AutoFlashcardsPage",
  component: AutoFlashcardsPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof AutoFlashcardsPage> = (args) => (
  <AutoFlashcardsPage {...args} />
);

export const AutoFlashcardsPageExample = Template.bind({});
AutoFlashcardsPageExample.parameters = {
  layout: "fullscreen",
};
