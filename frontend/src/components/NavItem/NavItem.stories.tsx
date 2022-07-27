import NavItem from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/NavItem",
  component: NavItem,
};

// TODO: add story

const Template: ComponentStory<typeof NavItem> = (args) => (
  <NavItem {...args} />
);

export const NavItemExample = Template.bind({});
NavItemExample.args = {};
