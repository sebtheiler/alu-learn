import withFullContext from "helpers/withFullContext";
import { ComponentStory } from "@storybook/react";

import Navbar from ".";

export default {
  title: "Components/Navbar",
  component: Navbar,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof Navbar> = (args) => <Navbar {...args} />;

export const NotLoggedIn = Template.bind({});
NotLoggedIn.args = {
  isLoggedIn: false,
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  isLoggedIn: true,
  streak: {
    currentStreak: 10,
    doneReviewsToday: true,
  },
  username: "username",
  isPro: true,
};
