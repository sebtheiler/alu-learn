import TextInput from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Atoms/TextInput",
  component: TextInput,
};

const Template: ComponentStory<typeof TextInput> = (args) => (
  <TextInput {...args} />
);

export const Text = Template.bind({});
Text.args = {
  label: "Example Label",
  type: "text",
  pill: true,
};

export const Number = Template.bind({});
Number.args = {
  label: "What's your favorite number?",
  type: "number",
  pill: true,
};

export const NoLabel = Template.bind({});
NoLabel.args = {
  label: "",
  type: "text",
  pill: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "Example Label",
  type: "text",
  pill: true,
  disabled: true,
};
