import SignInPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/SignInPage",
  component: SignInPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof SignInPage> = () => <SignInPage />;

export const SignInPageExample = Template.bind({});
SignInPageExample.parameters = {
  layout: "fullscreen",
};
