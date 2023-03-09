import Navbar from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/Navbar",
  component: Navbar,
};

const Template: ComponentStory<typeof Navbar> = (args) => <Navbar {...args} />;

export const NotSignedIn = Template.bind({});
NotSignedIn.args = {
  session: null,
  status: "unauthenticated",
  isPro: false,
  streak: undefined,
};

export const SignedIn = Template.bind({});
SignedIn.args = {
  session: {
    user: {
      name: "Sebastian Theiler",
      email: "stheiler05@westendsecondary.com",
      image: undefined,
    },
    expires: "2022-10-05T22:09:47.255Z",
  },
  status: "authenticated",
  streak: {
    currentStreak: 10,
    doneReviewsToday: true,
  },
  isPro: true,
};
