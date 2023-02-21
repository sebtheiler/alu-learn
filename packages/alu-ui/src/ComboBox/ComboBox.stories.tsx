import ComboBox from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "ComboBox",
  component: ComboBox,
};

const Template: ComponentStory<typeof ComboBox> = (args) => (
  <ComboBox {...args} />
);

export const ComboBoxExample = Template.bind({});
ComboBoxExample.args = {
  options: [
    { value: "johndoe", label: "John Doe" },
    { value: "janedoe", label: "Jane Doe" },
  ],
  placeholder: "User",
};
