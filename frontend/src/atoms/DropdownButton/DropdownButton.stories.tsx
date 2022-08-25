import DropdownButton from ".";
import {
  faBell,
  faBook,
  faCogs,
  faEnvelope,
  faSignOut,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";
import type { MenuOption } from "atoms/Dropdown";

const options = [
  { text: "My Profile", href: "/profile", faIcon: faUserCircle },
  { text: "Settings", href: "/settings", faIcon: faCogs },
  { text: "Notifications", href: "/notifications", faIcon: faBell },
  { divider: true },
  { text: "Changelog", href: "/changelog", faIcon: faBook },
  { text: "Log-out", href: "/logout", faIcon: faSignOut },
  { text: "Contact Us", href: "/contactus", faIcon: faEnvelope },
] as MenuOption[];

export default {
  title: "Atoms/DropdownButton",
  component: DropdownButton,
};

const Template: ComponentStory<typeof DropdownButton> = (args) => (
  <DropdownButton {...args}>Hello World</DropdownButton>
);

export const DropdownButtonExample = Template.bind({});
DropdownButtonExample.args = {
  options: options,
  className: "ml-20",
};
