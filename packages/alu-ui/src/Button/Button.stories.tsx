import Button from ".";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Button",
  component: Button,
};

const Template: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Hello World</Button>
);

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  pill: true,
  block: false,
};

export const Red = Template.bind({});
Red.args = {
  variant: "red",
  pill: true,
  block: false,
};

export const Yellow = Template.bind({});
Yellow.args = {
  variant: "yellow",
  pill: true,
  block: false,
};

export const Green = Template.bind({});
Green.args = {
  variant: "green",
  pill: true,
  block: false,
};

export const Blue = Template.bind({});
Blue.args = {
  variant: "blue",
  pill: true,
  block: false,
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  pill: true,
  block: false,
};

export const PrimaryOutline = Template.bind({});
PrimaryOutline.args = {
  variant: "primary-outline",
  pill: true,
  block: false,
};

export const NonPill = Template.bind({});
NonPill.args = {
  variant: "primary",
  pill: false,
  block: false,
};

export const Block = Template.bind({});
Block.args = {
  variant: "primary",
  pill: true,
  block: true,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  variant: "primary",
  pill: true,
  block: false,
  faIcon: faPlus,
};
