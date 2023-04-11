import TextArea from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "TextArea",
  component: TextArea,
};

const Template: ComponentStory<typeof TextArea> = (args) => (
  <TextArea {...args} />
);

export const Text = Template.bind({});
Text.args = {
  placeholder: "Example placeholder",
};
