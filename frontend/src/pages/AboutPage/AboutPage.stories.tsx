import AboutPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/AboutPage",
  component: AboutPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof AboutPage> = () => <AboutPage />;

export const AboutPageExample = Template.bind({});
AboutPageExample.parameters = {
  layout: "fullscreen",
};
