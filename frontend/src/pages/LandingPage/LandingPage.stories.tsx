import LandingPage from ".";
import { ComponentStory } from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Pages/LandingPage",
  component: LandingPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof LandingPage> = (args) => <LandingPage />;

export const LandingPageExample = Template.bind({});
LandingPageExample.parameters = {
  layout: "fullscreen",
}