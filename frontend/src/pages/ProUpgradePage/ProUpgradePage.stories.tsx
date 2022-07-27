import ProUpgradePage from ".";
import { ComponentStory } from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Pages/ProUpgradePage",
  component: ProUpgradePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradePage> = (args) => <ProUpgradePage />;

export const ProUpgradePageExample = Template.bind({});
ProUpgradePageExample.parameters = {
  layout: "fullscreen",
}