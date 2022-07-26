import { ComponentStory } from "@storybook/react";

import NavItem from ".";

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
