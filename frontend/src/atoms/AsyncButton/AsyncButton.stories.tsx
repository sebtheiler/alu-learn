import AsyncButton from ".";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Atoms/AsyncButton",
  component: AsyncButton,
};

const Template: ComponentStory<typeof AsyncButton> = (args) => (
  <AsyncButton {...args}>Hello World</AsyncButton>
);

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  pill: true,
  block: false,
  faIcon: faPlus,
  onClick: async () => await new Promise((r) => setTimeout(r, 2000)),
};
