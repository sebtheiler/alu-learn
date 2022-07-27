import Dropdown from ".";
import type { MenuOption } from "./Dropdown";
import {
  faBell,
  faBook,
  faCogs,
  faEnvelope,
  faSignOut,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";
import Button from "atoms/Button";

export default {
  title: "Atoms/Dropdown",
  component: Dropdown,
};

const options = [
  { text: "My Profile", href: "/profile", faIcon: faUserCircle },
  { text: "Settings", href: "/settings", faIcon: faCogs },
  { text: "Notifications", href: "/notifications", faIcon: faBell },
  { divider: true },
  { text: "Changelog", href: "/changelog", faIcon: faBook },
  { text: "Log-out", href: "/logout", faIcon: faSignOut },
  { text: "Contact Us", href: "/contactus", faIcon: faEnvelope },
] as MenuOption[];

const ButtonTemplate: ComponentStory<typeof Dropdown> = (args) => (
  <Dropdown {...args}>
    <Button>My Profile</Button>
  </Dropdown>
);
const TextTemplate: ComponentStory<typeof Dropdown> = (args) => (
  <Dropdown {...args}>My Profile</Dropdown>
);

export const ButtonDropdown = ButtonTemplate.bind({});
ButtonDropdown.args = {
  options: options,
  style: { marginLeft: "400px" },
};

export const TextDropdown = TextTemplate.bind({});
TextDropdown.args = {
  options: options,
  style: { marginLeft: "400px" },
};
