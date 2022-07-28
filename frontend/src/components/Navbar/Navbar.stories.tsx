import Navbar from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Components/Navbar",
  component: Navbar,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof Navbar> = (args) => <Navbar {...args} />;

export const NotSignedIn = Template.bind({});
NotSignedIn.args = {
  isSignedIn: false,
};

export const SignedIn = Template.bind({});
SignedIn.args = {
  isSignedIn: true,
  streak: {
    currentStreak: 10,
    doneReviewsToday: true,
  },
  username: "username",
  isPro: true,
};
