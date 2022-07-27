import ProUpgradeCancelledPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/ProUpgradeCancelledPage",
  component: ProUpgradeCancelledPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradeCancelledPage> = (args) => (
  <ProUpgradeCancelledPage />
);

export const ProUpgradeCancelledPageExample = Template.bind({});
ProUpgradeCancelledPageExample.parameters = {
  layout: "fullscreen",
};
