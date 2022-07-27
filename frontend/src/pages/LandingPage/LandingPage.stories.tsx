import LandingPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/LandingPage",
  component: LandingPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof LandingPage> = () => <LandingPage />;

export const LandingPageExample = Template.bind({});
LandingPageExample.parameters = {
  layout: "fullscreen",
};
