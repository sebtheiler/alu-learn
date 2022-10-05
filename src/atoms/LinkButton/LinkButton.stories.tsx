import LinkButton from ".";
import withFullContext from "@/helpers/withFullContext";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Atoms/LinkButton",
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
