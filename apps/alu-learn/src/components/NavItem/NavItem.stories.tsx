import NavItem from ".";
import { faCompass } from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/NavItem",
  component: NavItem,
};

const Template: ComponentStory<typeof NavItem> = (args) => (
  <div className="bg-alu-dark-purple p-5">
    <NavItem {...args}>Example</NavItem>
  </div>
);

export const NavItemExample = Template.bind({});
NavItemExample.args = {
  icon: faCompass,
  href: "/explore/decks",
};
