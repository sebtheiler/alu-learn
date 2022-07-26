import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

import ProUpgradePage from ".";

export default {
  title: "Pages/ProUpgradePage",
  component: ProUpgradePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradePage> = (args) => (
  <ProUpgradePage {...args} />
);

export const NotLoggedIn = Template.bind({});
NotLoggedIn.args = {
  isPro: false,
  isProFromOrg: false,
  isLoggedIn: false,
  proTrialExpires: null,
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  isPro: false,
  isProFromOrg: false,
  isLoggedIn: true,
  proTrialExpires: null,
};

export const IsPro = Template.bind({});
IsPro.args = {
  isPro: true,
  isProFromOrg: false,
  isLoggedIn: true,
  proTrialExpires: null,
};

const today = new Date();
today.setDate(today.getDate() + 3);
const inThreeDays = today.toISOString().slice(0, 10);
export const ProExpires = Template.bind({});
ProExpires.args = {
  isPro: true,
  isProFromOrg: false,
  isLoggedIn: true,
  proTrialExpires: inThreeDays,
};

export const ProFromOrganization = Template.bind({});
ProFromOrganization.args = {
  isPro: true,
  isProFromOrg: true,
  isLoggedIn: true,
  proTrialExpires: null,
};
