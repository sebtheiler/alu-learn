import FlashcardsPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/FlashcardsPage",
  component: FlashcardsPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof FlashcardsPage> = (args) => (
  <FlashcardsPage {...args} />
);

export const FlashcardsPageExample = Template.bind({});
FlashcardsPageExample.parameters = {
  layout: "fullscreen",
};
