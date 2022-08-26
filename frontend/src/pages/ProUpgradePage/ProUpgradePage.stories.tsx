import ProUpgradePage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/ProUpgradePage",
  component: ProUpgradePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradePage> = () => (
  <ProUpgradePage />
);

export const ProUpgradePageExample = Template.bind({});
ProUpgradePageExample.parameters = {
  layout: "fullscreen",
};
