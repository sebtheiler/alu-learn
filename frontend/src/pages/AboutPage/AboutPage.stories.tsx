import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

import AboutPage from ".";

export default {
  title: "Pages/AboutPage",
  component: AboutPage,
  layout: "fullscreen",
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof AboutPage> = (args) => (
  <AboutPage {...args} />
);

export const AboutPageExample = Template.bind({});
AboutPageExample.args = {
  isLoggedIn: false,
};
