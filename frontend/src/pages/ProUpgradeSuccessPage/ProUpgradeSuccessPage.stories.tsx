import ProUpgradeSuccessPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/ProUpgradeSuccessPage",
  component: ProUpgradeSuccessPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradeSuccessPage> = (args) => (
  <ProUpgradeSuccessPage />
);

export const ProUpgradeSuccessPageExample = Template.bind({});
ProUpgradeSuccessPageExample.parameters = {
  layout: "fullscreen",
};
