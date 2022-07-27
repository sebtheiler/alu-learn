import ProUpgradePage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/ProUpgradePage",
  component: ProUpgradePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradePage> = (args) => (
  <ProUpgradePage />
);

export const ProUpgradePageExample = Template.bind({});
ProUpgradePageExample.parameters = {
  layout: "fullscreen",
};
