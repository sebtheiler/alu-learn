import HomePage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "pages/HomePage",
  component: HomePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof HomePage> = (args) => (
  <HomePage {...args} />
);

export const HomePageExample = Template.bind({});
HomePageExample.parameters = {
  layout: "fullscreen",
};
