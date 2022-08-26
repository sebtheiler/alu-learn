import LandingPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

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
