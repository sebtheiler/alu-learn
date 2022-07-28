import SignInPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "pages/SignInPage",
  component: SignInPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof SignInPage> = (args) => (
  <SignInPage {...args} />
);

export const SignInPageExample = Template.bind({});
SignInPageExample.parameters = {
  layout: "fullscreen",
};
