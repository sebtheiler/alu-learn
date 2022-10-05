import DisplayUserInline from ".";
import withFullContext from "@/helpers/withFullContext";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/DisplayUserInline",
  component: DisplayUserInline,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof DisplayUserInline> = (args) => (
  <DisplayUserInline {...args} />
);

export const DefaultProfilePicture = Template.bind({});
DefaultProfilePicture.args = {
  user: {
    name: "Example User",
    image: null,
    id: "cl76ee56d0017l3i0jux1k9p2",
  },
};

export const CustomProfilePicture = Template.bind({});
CustomProfilePicture.args = {
  user: {
    name: "Example User",
    image:
      "https://lh3.googleusercontent.com/a-/AFdZucrpGXgJQ7S5DqW23qliKGL45MQg1Yrex59kINNyqQ=s96-c",
    id: "cl76ee56d0017l3i0jux1k9p2",
  },
};
