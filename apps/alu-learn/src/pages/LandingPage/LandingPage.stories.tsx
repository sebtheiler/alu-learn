import LandingPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/LandingPage",
  component: LandingPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof LandingPage> = () => <LandingPage />;

export const LandingPageExample = Template.bind({});
LandingPageExample.parameters = {
  layout: "fullscreen",
};
