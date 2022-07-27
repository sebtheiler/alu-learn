import WelcomePage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/WelcomePage",
  component: WelcomePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof WelcomePage> = (args) => <WelcomePage />;

export const WelcomePageExample = Template.bind({});
WelcomePageExample.parameters = {
  layout: "fullscreen",
};
