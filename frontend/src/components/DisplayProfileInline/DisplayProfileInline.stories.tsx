import DisplayProfileInline from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Components/DisplayProfileInline",
  component: DisplayProfileInline,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof DisplayProfileInline> = (args) => (
  <DisplayProfileInline {...args} />
);

export const ExampleUser = Template.bind({});
ExampleUser.args = {
  profile: {
    firstName: "Example",
    lastName: "User",
    username: "exampleuser",
  },
};
