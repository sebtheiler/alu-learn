import AboutPage from ".";
import { ComponentStory } from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Pages/AboutPage",
  component: AboutPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof AboutPage> = (args) => <AboutPage />;

export const AboutPageExample = Template.bind({});
AboutPageExample.parameters = {
  layout: "fullscreen",
}