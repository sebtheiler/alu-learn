import LinkButton from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Components/LinkButton",
  component: LinkButton,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof LinkButton> = (args) => (
  <LinkButton {...args}>Hello World</LinkButton>
);

export const LinkButtonExample = Template.bind({});
LinkButtonExample.args = {
  variant: "primary",
  href: "/home",
  pill: true,
  block: false,
};
